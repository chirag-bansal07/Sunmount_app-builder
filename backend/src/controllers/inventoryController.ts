import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getInventory = async (req: Request, res: Response) => {
  try {
    console.log("Fetching inventory...");
    const inventory = await prisma.product.findMany();
    console.log("Inventory fetched:", inventory.length, "items");
    res.json(inventory);
  } catch (error: any) {
    console.error("Inventory fetch error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch inventory: " + error.message });
  }
};

// export const manualUpdateInventory = async (req: Request, res: Response) => {
//   try {
//     const { product_code, qtyDelta } = req.body;

//     const product = await prisma.product.findUnique({ where: { product_code } });

//     if (!product) {
//       return prisma.product.create({
//       data: {
//         product_code,
//         name: 'Auto-created from purchase', // you can replace these with proper fields if available
//         description: '',
//         weight: 1,
//         price: 0,
//         quantity: qtyDelta,
//         last_updated: new Date()
//       }
//     });
//     }

//     const updatedProduct = await prisma.product.update({
//       where: { product_code },
//       data: {
//         quantity: product.quantity + qtyDelta,
//         last_updated: new Date(),
//       },
//     });

//     res.status(200).json(updatedProduct);
//   } catch (error: any) {
//     res.status(500).json({ error: 'Failed to update inventory' });
//   }
// };

export const manualUpdateInventory = async (req: Request, res: Response) => {
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

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error("Inventory update error:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { product_code } = req.params;
    const { name, description, weight, price } = req.body;

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
        name,
        description,
        weight,
        price,
        last_updated: new Date(),
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error("Product update error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
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

    res.status(201).json(product);
  } catch (error: any) {
    console.error("Add product error:", error);
    if (error.code === "P2002") {
      res.status(409).json({ error: "Product code already exists" });
    } else {
      res
        .status(500)
        .json({ error: "Failed to add product: " + error.message });
    }
  }
};
