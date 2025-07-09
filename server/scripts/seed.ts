import { getPrisma } from "../lib/prisma";

async function seed() {
  console.log("Seeding database...");

  const prisma = await getPrisma();

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.wipMaterial.deleteMany();
  await prisma.wipOutput.deleteMany();
  await prisma.wipBatch.deleteMany();
  await prisma.salesItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();

  // Create raw materials
  const rawMaterials = await Promise.all([
    prisma.product.create({
      data: {
        code: "RM001",
        name: "Steel Rod 10mm",
        description: "High grade steel rod for construction",
        quantity: 1000,
        unitPrice: 2.5,
        unit: "pcs",
        category: "Raw Materials",
        isRawMaterial: true,
      },
    }),
    prisma.product.create({
      data: {
        code: "RM002",
        name: "Aluminum Sheet 2mm",
        description: "Premium aluminum sheet",
        quantity: 500,
        unitPrice: 15.0,
        unit: "sqm",
        category: "Raw Materials",
        isRawMaterial: true,
      },
    }),
    prisma.product.create({
      data: {
        code: "RM003",
        name: "Plastic Pellets HDPE",
        description: "High-density polyethylene pellets",
        quantity: 2000,
        unitPrice: 1.2,
        unit: "kg",
        category: "Raw Materials",
        isRawMaterial: true,
      },
    }),
    prisma.product.create({
      data: {
        code: "RM004",
        name: "Copper Wire 2.5mm",
        description: "Electrical grade copper wire",
        quantity: 750,
        unitPrice: 8.5,
        unit: "m",
        category: "Raw Materials",
        isRawMaterial: true,
      },
    }),
    prisma.product.create({
      data: {
        code: "RM005",
        name: "Glass Sheet 5mm",
        description: "Tempered glass sheet",
        quantity: 200,
        unitPrice: 25.0,
        unit: "sqm",
        category: "Raw Materials",
        isRawMaterial: true,
      },
    }),
  ]);

  // Create finished products
  const finishedProducts = await Promise.all([
    prisma.product.create({
      data: {
        code: "FP001",
        name: "Steel Window Frame",
        description: "Custom steel window frame",
        quantity: 50,
        unitPrice: 120.0,
        unit: "pcs",
        category: "Finished Products",
        isRawMaterial: false,
      },
    }),
    prisma.product.create({
      data: {
        code: "FP002",
        name: "Aluminum Door Panel",
        description: "Premium aluminum door panel",
        quantity: 30,
        unitPrice: 180.0,
        unit: "pcs",
        category: "Finished Products",
        isRawMaterial: false,
      },
    }),
    prisma.product.create({
      data: {
        code: "FP003",
        name: "Plastic Container 5L",
        description: "Food grade plastic container",
        quantity: 100,
        unitPrice: 12.0,
        unit: "pcs",
        category: "Finished Products",
        isRawMaterial: false,
      },
    }),
    prisma.product.create({
      data: {
        code: "FP004",
        name: "Electrical Wire Harness",
        description: "Custom electrical wire harness",
        quantity: 25,
        unitPrice: 45.0,
        unit: "pcs",
        category: "Finished Products",
        isRawMaterial: false,
      },
    }),
    prisma.product.create({
      data: {
        code: "FP005",
        name: "Glass Cabinet Door",
        description: "Tempered glass cabinet door",
        quantity: 15,
        unitPrice: 85.0,
        unit: "pcs",
        category: "Finished Products",
        isRawMaterial: false,
      },
    }),
  ]);

  // Create some sample WIP batches
  const wipBatch1 = await prisma.wipBatch.create({
    data: {
      batchNumber: "WIP-2024-001",
      status: "COMPLETED",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-01-20"),
      notes: "First production batch for window frames",
    },
  });

  const wipBatch2 = await prisma.wipBatch.create({
    data: {
      batchNumber: "WIP-2024-002",
      status: "IN_PROGRESS",
      startDate: new Date("2024-01-25"),
      notes: "Current batch for door panels",
    },
  });

  // Add materials to WIP batch 1
  await Promise.all([
    prisma.wipMaterial.create({
      data: {
        batchId: wipBatch1.id,
        productId: rawMaterials[0].id, // Steel Rod
        quantity: 100,
      },
    }),
    prisma.wipMaterial.create({
      data: {
        batchId: wipBatch1.id,
        productId: rawMaterials[4].id, // Glass Sheet
        quantity: 20,
      },
    }),
  ]);

  // Add outputs to WIP batch 1
  await prisma.wipOutput.create({
    data: {
      batchId: wipBatch1.id,
      productId: finishedProducts[0].id, // Steel Window Frame
      quantity: 10,
    },
  });

  // Add materials to WIP batch 2
  await Promise.all([
    prisma.wipMaterial.create({
      data: {
        batchId: wipBatch2.id,
        productId: rawMaterials[1].id, // Aluminum Sheet
        quantity: 50,
      },
    }),
  ]);

  // Create transaction records for initial inventory
  for (const product of [...rawMaterials, ...finishedProducts]) {
    await prisma.transaction.create({
      data: {
        type: "ADJUSTMENT",
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        productId: product.id,
        reference: "INITIAL_STOCK",
        notes: "Initial inventory setup",
      },
    });
  }

  // Create WIP transaction records
  await Promise.all([
    prisma.transaction.create({
      data: {
        type: "WIP_INPUT",
        quantity: -100,
        productId: rawMaterials[0].id,
        reference: wipBatch1.batchNumber,
        notes: "Materials used in production",
      },
    }),
    prisma.transaction.create({
      data: {
        type: "WIP_INPUT",
        quantity: -20,
        productId: rawMaterials[4].id,
        reference: wipBatch1.batchNumber,
        notes: "Materials used in production",
      },
    }),
    prisma.transaction.create({
      data: {
        type: "WIP_OUTPUT",
        quantity: 10,
        productId: finishedProducts[0].id,
        reference: wipBatch1.batchNumber,
        notes: "Products completed from batch",
      },
    }),
    prisma.transaction.create({
      data: {
        type: "WIP_INPUT",
        quantity: -50,
        productId: rawMaterials[1].id,
        reference: wipBatch2.batchNumber,
        notes: "Materials used in current production",
      },
    }),
  ]);

  console.log("Database seeded successfully!");
  console.log(`Created ${rawMaterials.length} raw materials`);
  console.log(`Created ${finishedProducts.length} finished products`);
  console.log("Created 2 WIP batches with materials and outputs");
  console.log("Created transaction history");
}

seed()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = await getPrisma();
    await prisma.$disconnect();
  });
