import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const searchProductsByCode = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ message: "Missing or invalid query" });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        product_code: {
          startsWith: query,
        },
      },
      orderBy: { product_code: "asc" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to search products" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { product_code } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { product_code },
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: `Product with code '${product_code}' not found.` });
    }

    await prisma.product.delete({
      where: { product_code },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Product deletion error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
