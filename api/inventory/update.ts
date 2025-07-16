import { VercelRequest, VercelResponse } from "@vercel/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { product_code, qtyDelta } = req.body;

    const product = await prisma.product.findUnique({
      where: { product_code },
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: `Product with code '${product_code}' not found.` });
    }

    const updatedProduct = await prisma.product.update({
      where: { product_code },
      data: {
        quantity: product.quantity + qtyDelta,
        last_updated: new Date(),
      },
    });

    return res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error("Inventory update error:", error);
    return res.status(500).json({ error: "Failed to update inventory" });
  } finally {
    await prisma.$disconnect();
  }
}
