import {
  saveProducts,
  saveWipBatches,
  saveTransactions,
  generateId,
} from "../lib/dataStore";

async function seedJSON() {
  console.log("Seeding JSON data store...");

  // Create raw materials
  const rawMaterials = [
    {
      id: generateId(),
      code: "RM001",
      name: "Steel Rod 10mm",
      description: "High grade steel rod for construction",
      quantity: 1000,
      unitPrice: 2.5,
      unit: "pcs",
      category: "Raw Materials",
      isRawMaterial: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "RM002",
      name: "Aluminum Sheet 2mm",
      description: "Premium aluminum sheet",
      quantity: 500,
      unitPrice: 15.0,
      unit: "sqm",
      category: "Raw Materials",
      isRawMaterial: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "RM003",
      name: "Plastic Pellets HDPE",
      description: "High-density polyethylene pellets",
      quantity: 2000,
      unitPrice: 1.2,
      unit: "kg",
      category: "Raw Materials",
      isRawMaterial: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "RM004",
      name: "Copper Wire 2.5mm",
      description: "Electrical grade copper wire",
      quantity: 750,
      unitPrice: 8.5,
      unit: "m",
      category: "Raw Materials",
      isRawMaterial: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "RM005",
      name: "Glass Sheet 5mm",
      description: "Tempered glass sheet",
      quantity: 200,
      unitPrice: 25.0,
      unit: "sqm",
      category: "Raw Materials",
      isRawMaterial: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Create finished products
  const finishedProducts = [
    {
      id: generateId(),
      code: "FP001",
      name: "Steel Window Frame",
      description: "Custom steel window frame",
      quantity: 50,
      unitPrice: 120.0,
      unit: "pcs",
      category: "Finished Products",
      isRawMaterial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "FP002",
      name: "Aluminum Door Panel",
      description: "Premium aluminum door panel",
      quantity: 30,
      unitPrice: 180.0,
      unit: "pcs",
      category: "Finished Products",
      isRawMaterial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "FP003",
      name: "Plastic Container 5L",
      description: "Food grade plastic container",
      quantity: 100,
      unitPrice: 12.0,
      unit: "pcs",
      category: "Finished Products",
      isRawMaterial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "FP004",
      name: "Electrical Wire Harness",
      description: "Custom electrical wire harness",
      quantity: 25,
      unitPrice: 45.0,
      unit: "pcs",
      category: "Finished Products",
      isRawMaterial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      code: "FP005",
      name: "Glass Cabinet Door",
      description: "Tempered glass cabinet door",
      quantity: 15,
      unitPrice: 85.0,
      unit: "pcs",
      category: "Finished Products",
      isRawMaterial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const allProducts = [...rawMaterials, ...finishedProducts];

  // Create sample WIP batches
  const wipBatches = [
    {
      id: generateId(),
      batchNumber: "WIP-2024-001",
      status: "COMPLETED",
      startDate: new Date("2024-01-15").toISOString(),
      endDate: new Date("2024-01-20").toISOString(),
      notes: "First production batch for window frames",
      materials: [
        {
          id: generateId(),
          quantity: 100,
          product: rawMaterials[0], // Steel Rod
        },
        {
          id: generateId(),
          quantity: 20,
          product: rawMaterials[4], // Glass Sheet
        },
      ],
      outputs: [
        {
          id: generateId(),
          quantity: 10,
          product: finishedProducts[0], // Steel Window Frame
        },
      ],
    },
    {
      id: generateId(),
      batchNumber: "WIP-2024-002",
      status: "IN_PROGRESS",
      startDate: new Date("2024-01-25").toISOString(),
      notes: "Current batch for door panels",
      materials: [
        {
          id: generateId(),
          quantity: 50,
          product: rawMaterials[1], // Aluminum Sheet
        },
      ],
      outputs: [],
    },
  ];

  // Create transaction records
  const transactions = [];

  // Initial stock transactions
  for (const product of allProducts) {
    transactions.push({
      id: generateId(),
      type: "ADJUSTMENT",
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      productId: product.id,
      reference: "INITIAL_STOCK",
      notes: "Initial inventory setup",
      createdAt: product.createdAt,
    });
  }

  // WIP transactions
  transactions.push(
    {
      id: generateId(),
      type: "WIP_INPUT",
      quantity: -100,
      productId: rawMaterials[0].id,
      reference: "WIP-2024-001",
      notes: "Materials used in production",
      createdAt: new Date("2024-01-15").toISOString(),
    },
    {
      id: generateId(),
      type: "WIP_INPUT",
      quantity: -20,
      productId: rawMaterials[4].id,
      reference: "WIP-2024-001",
      notes: "Materials used in production",
      createdAt: new Date("2024-01-15").toISOString(),
    },
    {
      id: generateId(),
      type: "WIP_OUTPUT",
      quantity: 10,
      productId: finishedProducts[0].id,
      reference: "WIP-2024-001",
      notes: "Products completed from batch",
      createdAt: new Date("2024-01-20").toISOString(),
    },
    {
      id: generateId(),
      type: "WIP_INPUT",
      quantity: -50,
      productId: rawMaterials[1].id,
      reference: "WIP-2024-002",
      notes: "Materials used in current production",
      createdAt: new Date("2024-01-25").toISOString(),
    },
  );

  // Save all data
  await Promise.all([
    saveProducts(allProducts),
    saveWipBatches(wipBatches),
    saveTransactions(transactions),
  ]);

  console.log("JSON data store seeded successfully!");
  console.log(`Created ${rawMaterials.length} raw materials`);
  console.log(`Created ${finishedProducts.length} finished products`);
  console.log("Created 2 WIP batches with materials and outputs");
  console.log("Created transaction history");
}

seedJSON().catch((e) => {
  console.error("Error seeding JSON data store:", e);
  process.exit(1);
});
