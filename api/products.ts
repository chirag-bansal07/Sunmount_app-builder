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

  try {
    if (req.method === "GET") {
      const products = await prisma.product.findMany();
      return res.json(products);
    }

    if (req.method === "POST") {
      const { product_code, name, description, weight, price, quantity } =
        req.body;

      const product = await prisma.product.create({
        data: {
          product_code,
          name,
          description,
          weight,
          price,
          quantity,
          last_updated: new Date(),
        },
      });

      return res.status(201).json(product);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Products API error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Product code already exists" });
    }
    return res.status(500).json({ error: "Failed to process request" });
  } finally {
    await prisma.$disconnect();
  }
}
