import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.workInProgress.deleteMany();
  await prisma.product.deleteMany();

  // Create sample products
  const products = [
    {
      product_code: "RM001",
      name: "Steel Rod",
      description: "High quality steel rod for manufacturing",
      weight: 5.0,
      price: 25.0,
      quantity: 100,
      last_updated: new Date(),
    },
    {
      product_code: "RM002",
      name: "Aluminum Sheet",
      description: "Aluminum sheet for fabrication",
      weight: 2.5,
      price: 15.0,
      quantity: 50,
      last_updated: new Date(),
    },
    {
      product_code: "FG001",
      name: "Finished Widget",
      description: "Completed widget product",
      weight: 1.0,
      price: 100.0,
      quantity: 0,
      last_updated: new Date(),
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("✅ Sample data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
