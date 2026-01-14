import { apiClient } from './client';
import type { Product } from './products';
import type { StockMovement } from './stock';

export interface StockSummary {
  totalProducts: number;
  activeProducts: number;
  totalStockItems: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface LowStockReport {
  count: number;
  products: Product[];
}

export interface VolumeTodayMetrics {
  ordersToShip: number;
  overdueShipments: number;
  openPOs: number;
  lateVendorShipments: number;
}

export interface MonthlyKPIs {
  inventory: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    trend: number[];
  };
  shippingCosts: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    trend: number[];
  };
  perfectOrderRate: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    trend: number[];
  };
  backOrderRate: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    trend: number[];
  };
  warehouseCapacity: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    trend: number[];
  };
}

export interface FinancialPerformance {
  regions: {
    region: string;
    cashToCashCycle: number;
    accountRecDays: number;
    inventoryDays: number;
    accountsPayableDays: number;
  }[];
}

export interface InventoryDistribution {
  name: string;
  value: number;
}

export const reportsApi = {
  getLowStock: async (): Promise<LowStockReport> => {
    const response = await apiClient.get<LowStockReport>('/reports/low-stock');
    return response.data;
  },
  getStockSummary: async (): Promise<StockSummary> => {
    const response = await apiClient.get<StockSummary>('/reports/stock-summary');
    return response.data;
  },
  getVolumeToday: async (): Promise<VolumeTodayMetrics> => {
    const response = await apiClient.get<VolumeTodayMetrics>('/reports/volume-today');
    return response.data;
  },
  getMonthlyKPIs: async (): Promise<MonthlyKPIs> => {
    const response = await apiClient.get<MonthlyKPIs>('/reports/monthly-kpis');
    return response.data;
  },
  getFinancialPerformance: async (): Promise<FinancialPerformance> => {
    const response = await apiClient.get<FinancialPerformance>('/reports/financial-performance');
    return response.data;
  },
  getInventoryDistribution: async (): Promise<InventoryDistribution[]> => {
    const response = await apiClient.get<InventoryDistribution[]>('/reports/inventory-distribution');
    return response.data;
  },
};
