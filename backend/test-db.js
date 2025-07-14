const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const products = await prisma.product.findMany();
    console.log("Success! Found", products.length, "products");
    console.log("Products:", products);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
