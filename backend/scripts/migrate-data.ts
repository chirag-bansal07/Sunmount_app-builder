import { PrismaClient as SqlitePrisma } from "@prisma/client/sqlite";
import { PrismaClient as PostgresPrisma } from "@prisma/client";

const sqliteClient = new SqlitePrisma({
  datasources: {
    db: {
      url: "file:./prisma/inventory.db",
    },
  },
});

const postgresClient = new PostgresPrisma();

async function migrateData() {
  try {
    console.log("🔄 Starting data migration from SQLite to PostgreSQL...");

    // Migrate Products
    console.log("📦 Migrating products...");
    const products = await sqliteClient.product.findMany();
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      await postgresClient.product.upsert({
        where: { product_code: product.product_code },
        update: {
          name: product.name,
          description: product.description,
          weight: product.weight,
          price: product.price,
          quantity: product.quantity,
          last_updated: product.last_updated,
        },
        create: {
          product_code: product.product_code,
          name: product.name,
          description: product.description,
          weight: product.weight,
          price: product.price,
          quantity: product.quantity,
          last_updated: product.last_updated,
        },
      });
    }

    // Migrate WIP batches
    console.log("🏭 Migrating WIP batches...");
    const wipBatches = await sqliteClient.workInProgress.findMany();
    console.log(`Found ${wipBatches.length} WIP batches`);

    for (const batch of wipBatches) {
      await postgresClient.workInProgress.upsert({
        where: { batch_number: batch.batch_number },
        update: {
          raw_materials: batch.raw_materials,
          output: batch.output,
          status: batch.status,
          start_date: batch.start_date,
          end_date: batch.end_date,
        },
        create: {
          batch_number: batch.batch_number,
          raw_materials: batch.raw_materials,
          output: batch.output,
          status: batch.status,
          start_date: batch.start_date,
          end_date: batch.end_date,
        },
      });
    }

    // Migrate Orders
    console.log("📋 Migrating orders...");
    const orders = await sqliteClient.order.findMany();
    console.log(`Found ${orders.length} orders`);

    for (const order of orders) {
      await postgresClient.order.upsert({
        where: { order_id: order.order_id },
        update: {
          type: order.type,
          bom: order.bom,
          party_id: order.party_id,
          products: order.products,
          status: order.status,
          date: order.date,
          notes: order.notes,
        },
        create: {
          order_id: order.order_id,
          type: order.type,
          bom: order.bom,
          party_id: order.party_id,
          products: order.products,
          status: order.status,
          date: order.date,
          notes: order.notes,
        },
      });
    }

    // Migrate Customers
    console.log("👥 Migrating customers...");
    const customers = await sqliteClient.customer.findMany();
    console.log(`Found ${customers.length} customers`);

    for (const customer of customers) {
      await postgresClient.customer.upsert({
        where: { id: customer.id },
        update: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        },
        create: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        },
      });
    }

    // Migrate Suppliers
    console.log("🏪 Migrating suppliers...");
    const suppliers = await sqliteClient.supplier.findMany();
    console.log(`Found ${suppliers.length} suppliers`);

    for (const supplier of suppliers) {
      await postgresClient.supplier.upsert({
        where: { id: supplier.id },
        update: {
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
        },
        create: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
        },
      });
    }

    console.log("✅ Migration completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Products: ${products.length}`);
    console.log(`   - WIP Batches: ${wipBatches.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Suppliers: ${suppliers.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateData };
