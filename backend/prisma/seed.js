const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // --- Users (one for each main role) ---
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: passwordHash,
      name: 'Inventory Manager',
      role: 'MANAGER',
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: passwordHash,
      name: 'Warehouse Staff',
      role: 'STAFF',
      isActive: true,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      password: passwordHash,
      name: 'Business Viewer',
      role: 'VIEWER',
      isActive: true,
    },
  });

  // --- Settings (for Admin settings page) ---
  await prisma.appSetting.upsert({
    where: { key: 'COMPANY_NAME' },
    update: { value: 'Indus Demo Corp' },
    create: { key: 'COMPANY_NAME', value: 'Indus Demo Corp' },
  });
  await prisma.appSetting.upsert({
    where: { key: 'CURRENCY' },
    update: { value: 'USD' },
    create: { key: 'CURRENCY', value: 'USD' },
  });
  await prisma.appSetting.upsert({
    where: { key: 'TIMEZONE' },
    update: { value: 'Asia/Kolkata' },
    create: { key: 'TIMEZONE', value: 'Asia/Kolkata' },
  });
  await prisma.appSetting.upsert({
    where: { key: 'SMTP_FROM' },
    update: { value: 'no-reply@example.com' },
    create: { key: 'SMTP_FROM', value: 'no-reply@example.com' },
  });

  // --- Categories ---
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics', description: 'Phones, laptops and gadgets' },
  });

  const accessories = await prisma.category.upsert({
    where: { name: 'Accessories' },
    update: {},
    create: { name: 'Accessories', description: 'Cables, chargers, and peripherals' },
  });

  // --- Warehouses & Locations ---
  const whMain = await prisma.warehouse.upsert({
    where: { shortCode: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      shortCode: 'WH-MAIN',
      address: '1 Industrial Road',
    },
  });

  const whEast = await prisma.warehouse.upsert({
    where: { shortCode: 'WH-EAST' },
    update: {},
    create: {
      name: 'East Warehouse',
      shortCode: 'WH-EAST',
      address: '99 Eastern Ave',
    },
  });

  const locMainA = await prisma.location.upsert({
    where: { name_warehouseId: { name: 'Rack A', warehouseId: whMain.id } },
    update: {},
    create: { name: 'Rack A', shortCode: 'A', warehouseId: whMain.id },
  });

  const locMainB = await prisma.location.upsert({
    where: { name_warehouseId: { name: 'Rack B', warehouseId: whMain.id } },
    update: {},
    create: { name: 'Rack B', shortCode: 'B', warehouseId: whMain.id },
  });

  const locEastA = await prisma.location.upsert({
    where: { name_warehouseId: { name: 'Rack A', warehouseId: whEast.id } },
    update: {},
    create: { name: 'Rack A', shortCode: 'A', warehouseId: whEast.id },
  });

  // --- Suppliers (for Manager supplier management) ---
  const supplierAlpha = await prisma.supplier.upsert({
    where: { name: 'Alpha Distributors' },
    update: {},
    create: {
      name: 'Alpha Distributors',
      email: 'sales@alpha.example.com',
      phone: '+1-555-0100',
      address: '42 Market Street',
    },
  });

  const supplierBeta = await prisma.supplier.upsert({
    where: { name: 'Beta Imports' },
    update: {},
    create: {
      name: 'Beta Imports',
      email: 'hello@beta.example.com',
      phone: '+1-555-0200',
      address: '88 Harbor Way',
    },
  });

  // --- Products + initial stock (for all flows + reports) ---
  const iphone = await prisma.product.upsert({
    where: { sku: 'IP13-128-BLK' },
    update: {},
    create: {
      name: 'iPhone 13 128GB Black',
      sku: 'IP13-128-BLK',
      unitOfMeasure: 'pcs',
      reorderLevel: 10,
      costPrice: 550,
      salePrice: 799,
      categoryId: electronics.id,
    },
  });

  const macbook = await prisma.product.upsert({
    where: { sku: 'MBP-14-M2' },
    update: {},
    create: {
      name: 'MacBook Pro 14" M2',
      sku: 'MBP-14-M2',
      unitOfMeasure: 'pcs',
      reorderLevel: 5,
      costPrice: 1400,
      salePrice: 1899,
      categoryId: electronics.id,
    },
  });

  const usbcCable = await prisma.product.upsert({
    where: { sku: 'USB-C-1M' },
    update: {},
    create: {
      name: 'USB-C Cable 1m',
      sku: 'USB-C-1M',
      unitOfMeasure: 'pcs',
      reorderLevel: 50,
      costPrice: 2,
      salePrice: 9.99,
      categoryId: accessories.id,
    },
  });

  // Stocks
  const ensureStock = async (productId, locationId, quantity) => {
    await prisma.stock.upsert({
      where: { productId_locationId: { productId, locationId } },
      update: { quantity },
      create: { productId, locationId, quantity },
    });
  };

  await ensureStock(iphone.id, locMainA.id, 15);
  await ensureStock(iphone.id, locEastA.id, 5);
  await ensureStock(macbook.id, locMainB.id, 3);
  await ensureStock(usbcCable.id, locMainA.id, 120);

  // --- Example receipts / deliveries / transfers / adjustments ---
  // Receipt from Alpha for iPhones and cables
  const receipt = await prisma.receipt.upsert({
    where: { reference: 'RCPT-1001' },
    update: {},
    create: {
      reference: 'RCPT-1001',
      supplier: supplierAlpha.name,
      supplierId: supplierAlpha.id,
      locationId: locMainA.id,
      status: 'DONE',
      items: {
        create: [
          { productId: iphone.id, quantity: 10 },
          { productId: usbcCable.id, quantity: 200 },
        ],
      },
    },
  });

  // Simple delivery
  const delivery = await prisma.deliveryOrder.upsert({
    where: { reference: 'DO-1001' },
    update: {},
    create: {
      reference: 'DO-1001',
      customer: 'Retail Customer',
      locationId: locMainA.id,
      status: 'READY',
      items: {
        create: [{ productId: iphone.id, quantity: 2 }],
      },
    },
  });

  // Internal transfer between locations
  const transfer = await prisma.internalTransfer.upsert({
    where: { reference: 'TRF-1001' },
    update: {},
    create: {
      reference: 'TRF-1001',
      sourceLocId: locMainA.id,
      destLocId: locMainB.id,
      status: 'READY',
      items: {
        create: [{ productId: usbcCable.id, quantity: 20 }],
      },
    },
  });

  // Stock adjustment example
  await prisma.stockAdjustment.upsert({
    where: { reference: 'ADJ-1001' },
    update: {},
    create: {
      reference: 'ADJ-1001',
      locationId: locMainA.id,
      productId: iphone.id,
      countedQty: 14,
      systemQty: 15,
      difference: -1,
      reason: 'Damaged unit written off',
      status: 'DRAFT',
    },
  });

  console.log('Seed data inserted.');
  console.log('Users created:');
  console.log(`  Admin   -> admin@example.com / Password123!`);
  console.log(`  Manager -> manager@example.com / Password123!`);
  console.log(`  Staff   -> staff@example.com / Password123!`);
  console.log(`  Viewer  -> viewer@example.com / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

