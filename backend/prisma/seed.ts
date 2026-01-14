import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create organizations
  const org1 = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Organization 1',
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Demo Organization 2',
    },
  });

  console.log('✅ Created organizations');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: org1.id,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: hashedPassword,
      name: 'Staff User',
      role: 'STAFF',
      organizationId: org1.id,
    },
  });

  // Create admin for second organization
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@example.com' },
    update: {},
    create: {
      email: 'admin2@example.com',
      password: hashedPassword,
      name: 'Admin User 2',
      role: 'ADMIN',
      organizationId: org2.id,
    },
  });

  console.log('✅ Created users:', { admin: admin.email, staff: staff.email, admin2: admin2.email });

  // Create categories for org1
  const electronics = await prisma.category.upsert({
    where: { 
      name_organizationId: {
        name: 'Electronics',
        organizationId: org1.id,
      }
    },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      organizationId: org1.id,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { 
      name_organizationId: {
        name: 'Clothing',
        organizationId: org1.id,
      }
    },
    update: {},
    create: {
      name: 'Clothing',
      description: 'Apparel and fashion items',
      organizationId: org1.id,
    },
  });

  const food = await prisma.category.upsert({
    where: { 
      name_organizationId: {
        name: 'Food & Beverages',
        organizationId: org1.id,
      }
    },
    update: {},
    create: {
      name: 'Food & Beverages',
      description: 'Food items and drinks',
      organizationId: org1.id,
    },
  });

  const office = await prisma.category.upsert({
    where: { 
      name_organizationId: {
        name: 'Office Supplies',
        organizationId: org1.id,
      }
    },
    update: {},
    create: {
      name: 'Office Supplies',
      description: 'Office equipment and supplies',
      organizationId: org1.id,
    },
  });

  console.log('✅ Created categories');

  // Create products
  const products = [
    {
      name: 'Laptop Computer',
      sku: 'LAP-001',
      categoryId: electronics.id,
      description: 'High-performance laptop for business use',
      costPrice: 800,
      sellingPrice: 1200,
      currentStock: 15,
      minimumStock: 10,
      unit: 'pcs',
      status: 'ACTIVE',
    },
    {
      name: 'Wireless Mouse',
      sku: 'MOU-001',
      categoryId: electronics.id,
      description: 'Ergonomic wireless mouse',
      costPrice: 15,
      sellingPrice: 25,
      currentStock: 50,
      minimumStock: 20,
      unit: 'pcs',
      status: 'ACTIVE' as const,
    },
    {
      name: 'T-Shirt',
      sku: 'TSH-001',
      categoryId: clothing.id,
      description: 'Cotton t-shirt',
      costPrice: 10,
      sellingPrice: 20,
      currentStock: 5,
      minimumStock: 15,
      unit: 'pcs',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Jeans',
      sku: 'JEA-001',
      categoryId: clothing.id,
      description: 'Classic blue jeans',
      costPrice: 30,
      sellingPrice: 60,
      currentStock: 8,
      minimumStock: 10,
      unit: 'pcs',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Coffee Beans',
      sku: 'COF-001',
      categoryId: food.id,
      description: 'Premium arabica coffee beans',
      costPrice: 12,
      sellingPrice: 20,
      currentStock: 25,
      minimumStock: 30,
      unit: 'kg',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Notebook',
      sku: 'NOT-001',
      categoryId: office.id,
      description: 'A4 size notebook',
      costPrice: 2,
      sellingPrice: 5,
      currentStock: 100,
      minimumStock: 50,
      unit: 'pcs',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Pen Set',
      sku: 'PEN-001',
      categoryId: office.id,
      description: 'Set of 10 ballpoint pens',
      costPrice: 3,
      sellingPrice: 8,
      currentStock: 2,
      minimumStock: 20,
      unit: 'box',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Smartphone',
      sku: 'PHO-001',
      categoryId: electronics.id,
      description: 'Latest model smartphone',
      costPrice: 500,
      sellingPrice: 800,
      currentStock: 0,
      minimumStock: 5,
      unit: 'pcs',
      status: 'ACTIVE' as const,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { 
        sku_organizationId: {
          sku: product.sku,
          organizationId: org1.id,
        }
      },
      update: {},
      create: {
        ...product,
        organizationId: org1.id,
      },
    });
  }

  console.log('✅ Created products');

  // Create some stock movements
  const laptop = await prisma.product.findFirst({
    where: { 
      sku: 'LAP-001',
      organizationId: org1.id,
    },
  });

  if (laptop) {
    await prisma.stockMovement.create({
      data: {
        productId: laptop.id,
        organizationId: org1.id,
        quantity: 15,
        type: 'IN',
        reason: 'Initial stock',
        userId: admin.id,
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: laptop.id,
        organizationId: org1.id,
        quantity: -2,
        type: 'OUT',
        reason: 'Sale to customer',
        userId: staff.id,
      },
    });
  }

  console.log('✅ Created stock movements');

  // Create sample orders
  const today = new Date();
  const customers = ['Testa Inc.', 'Weldon', 'Johnny\'s', 'Welltown Inc.', 'Richards Brothers', 'Smith Corp', 'Johnson Ltd', 'Williams Industries'];
  
  for (let i = 0; i < customers.length; i++) {
    const orderDate = new Date(today);
    orderDate.setDate(orderDate.getDate() - (i + 1));
    
    await prisma.order.create({
      data: {
        organizationId: org1.id,
        customerName: customers[i],
        status: i < 5 ? 'BACKORDERED' : i < 7 ? 'PENDING' : 'SHIPPED',
        orderDate: orderDate,
        totalAmount: Math.floor(Math.random() * 5000) + 500,
        dueDate: i < 2 ? new Date(today.getTime() - 24 * 60 * 60 * 1000) : null, // Some overdue
        shippedDate: i >= 7 ? new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }

  console.log('✅ Created orders');

  // Create sample purchase orders
  const vendors = ['Vendor A', 'Vendor B', 'Supplier X', 'Supplier Y'];
  const poNumbers = ['PO-001', 'PO-002', 'PO-003', 'PO-004'];
  
  for (let i = 0; i < vendors.length; i++) {
    const orderDate = new Date(today);
    orderDate.setDate(orderDate.getDate() - (i * 7));
    const expectedDate = new Date(orderDate);
    expectedDate.setDate(expectedDate.getDate() + 14);
    
    await prisma.purchaseOrder.create({
      data: {
        organizationId: org1.id,
        vendorName: vendors[i],
        poNumber: poNumbers[i],
        status: i < 2 ? 'OPEN' : 'RECEIVED',
        orderDate: orderDate,
        expectedDate: expectedDate,
        receivedDate: i >= 2 ? new Date(expectedDate.getTime() + (i === 2 ? -2 : 5) * 24 * 60 * 60 * 1000) : null,
        totalAmount: Math.floor(Math.random() * 10000) + 1000,
        isLate: i === 3 && expectedDate < today && i < 2,
      },
    });
  }

  console.log('✅ Created purchase orders');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
