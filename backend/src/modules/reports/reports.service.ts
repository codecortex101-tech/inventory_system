import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getLowStockReport(organizationId: string) {
    const allProducts = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        organizationId: organizationId,
      },
      include: {
        category: true,
      },
    });

    // Filter products where currentStock <= minimumStock
    const products = allProducts
      .filter((product) => product.currentStock <= product.minimumStock)
      .sort((a, b) => a.currentStock - b.currentStock);

    return {
      count: products.length,
      products,
    };
  }

  async getStockSummary(organizationId: string) {
    const [
      totalProducts,
      activeProducts,
      totalStockItems,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      this.prisma.product.count({ where: { organizationId: organizationId } }),
      this.prisma.product.count({ where: { status: 'ACTIVE', organizationId: organizationId } }),
      this.prisma.product.aggregate({
        where: { organizationId: organizationId },
        _sum: { currentStock: true },
      }),
      this.prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          organizationId: organizationId,
        },
        select: {
          currentStock: true,
          minimumStock: true,
        },
      }).then((products) =>
        products.filter((p) => p.currentStock <= p.minimumStock).length,
      ),
      this.prisma.product.count({
        where: {
          status: 'ACTIVE',
          currentStock: 0,
          organizationId: organizationId,
        },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      totalStockItems: totalStockItems._sum.currentStock || 0,
      lowStockCount,
      outOfStockCount,
    };
  }

  async getVolumeTodayMetrics(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Open POs (Purchase Orders with OPEN status)
    const openPOs = await this.prisma.purchaseOrder.count({
      where: {
        organizationId,
        status: 'OPEN',
      },
    });

    // Late Vendor Shipments (POs with expectedDate in past and not received)
    const lateVendorShipments = await this.prisma.purchaseOrder.count({
      where: {
        organizationId,
        expectedDate: { lt: today },
        receivedDate: null,
        status: { not: 'RECEIVED' },
      },
    });

    return {
      ordersToShip: 0,
      overdueShipments: 0,
      openPOs,
      lateVendorShipments,
    };
  }

  async getMonthlyKPIs(organizationId: string) {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    // Calculate inventory value (sum of costPrice * currentStock)
    const products = await this.prisma.product.findMany({
  where: { organizationId },
  select: {
    costPrice: true,
    currentStock: true,
    minimumStock: true,
    createdAt: true,
  },
});


    // Current month inventory value (using current stock values)
    const thisMonthInventory = products.reduce((sum, p) => sum + (p.costPrice * (p.currentStock || 0)), 0);
    
    // For last month, estimate by reducing current values by 10% (simulated)
    const lastMonthInventory = thisMonthInventory > 0 ? thisMonthInventory * 0.9 : 0;

    const inventoryChange = lastMonthInventory > 0 
      ? ((thisMonthInventory - lastMonthInventory) / lastMonthInventory) * 100 
      : (thisMonthInventory > 0 ? 10 : 0);

    // Shipping Costs (simulated - no orders)
    const thisMonthShipping = 0;
    const lastMonthShipping = 0;
    const shippingChange = 0;

    // Perfect Order Rate (simulated - no orders)
    const perfectOrderRate = 100;

    // Back Order Rate (simulated - no orders)
    const backOrderRate = 0;

    // Warehouse Capacity (estimate based on current stock vs maximum possible)
    const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
    const maxPossibleStock = products.reduce((sum, p) => sum + (p.minimumStock * 10), 0);
    const warehouseCapacity = maxPossibleStock > 0
      ? (totalStock / maxPossibleStock) * 100
      : 0;

    // Generate trend data (past 30 days) - simulate gradual growth/decline
    const trendData = [];
    const baseValue = thisMonthInventory;
    for (let i = 29; i >= 0; i--) {
      // Simulate trend by gradually increasing/decreasing from base
      const variation = (i / 29) * 0.1; // 10% variation over 30 days
      const value = baseValue * (0.9 + variation);
      trendData.push({
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.max(0, value),
      });
    }

    return {
      inventory: {
        thisMonth: thisMonthInventory,
        lastMonth: lastMonthInventory,
        change: Math.round(inventoryChange * 10) / 10,
        trend: trendData.map(t => t.value),
      },
      shippingCosts: {
        thisMonth: thisMonthShipping,
        lastMonth: lastMonthShipping,
        change: Math.round(shippingChange * 10) / 10,
        trend: Array.from({ length: 30 }, (_, i) => {
          // Simulate downward trend
          const baseValue = thisMonthShipping;
          const variation = (i / 29) * 0.15; // 15% variation
          return baseValue * (1.15 - variation);
        }),
      },
      perfectOrderRate: {
        thisMonth: Math.round(perfectOrderRate * 10) / 10,
        lastMonth: Math.max(90, perfectOrderRate - 0.5), // Simulated based on current
        change: Math.round((perfectOrderRate - Math.max(90, perfectOrderRate - 0.5)) * 10) / 10,
        trend: Array.from({ length: 30 }, (_, i) => {
          const baseValue = perfectOrderRate;
          const variation = (i / 29) * 2; // Small variation
          return Math.max(85, Math.min(100, baseValue - 1 + (variation / 29)));
        }),
      },
      backOrderRate: {
        thisMonth: Math.round(backOrderRate * 10) / 10,
        lastMonth: Math.min(15, backOrderRate + 0.5), // Simulated
        change: Math.round((backOrderRate - Math.min(15, backOrderRate + 0.5)) * 10) / 10,
        trend: Array.from({ length: 30 }, (_, i) => {
          const baseValue = backOrderRate;
          const variation = (i / 29) * 2; // Small variation
          return Math.max(8, Math.min(20, baseValue + 1 - (variation / 29)));
        }),
      },
      warehouseCapacity: {
        thisMonth: Math.round(warehouseCapacity * 10) / 10,
        lastMonth: Math.min(99, warehouseCapacity + 2.6), // Simulated
        change: Math.round((warehouseCapacity - Math.min(99, warehouseCapacity + 2.6)) * 10) / 10,
        trend: Array.from({ length: 30 }, (_, i) => {
          const baseValue = warehouseCapacity;
          const variation = (i / 29) * 5; // Small variation
          return Math.max(85, Math.min(100, baseValue - 2.5 + (variation / 29)));
        }),
      },
    };
  }

  async getFinancialPerformance(organizationId: string) {
    // Simulated financial metrics by region
    // In real implementation, you would calculate based on actual data
    return {
      regions: [
        {
          region: 'NA',
          cashToCashCycle: -10,
          accountRecDays: 15,
          inventoryDays: 20,
          accountsPayableDays: 45,
        },
        {
          region: 'EUR',
          cashToCashCycle: 5,
          accountRecDays: 18,
          inventoryDays: 25,
          accountsPayableDays: 38,
        },
        {
          region: 'Asia',
          cashToCashCycle: 15,
          accountRecDays: 20,
          inventoryDays: 18,
          accountsPayableDays: 25,
        },
        {
          region: 'SA',
          cashToCashCycle: 18,
          accountRecDays: 28,
          inventoryDays: 30,
          accountsPayableDays: 38,
        },
      ],
    };
  }

  async getInventoryDistribution(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: { organizationId },
      select: {
        currentStock: true,
        category: {
          select: { name: true },
        },
      },
    });

    // Group by category and sum stock
    const categoryMap = new Map<string, number>();
    products.forEach(product => {
      const categoryName = product.category?.name || 'Other';
      const current = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, current + (product.currentStock || 0));
    });

    // Convert to array format for charts
    const distribution = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return distribution;
  }

}
