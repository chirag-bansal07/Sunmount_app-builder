import { RequestHandler } from "express";
import { z } from "zod";
import {
  getProducts,
  saveProducts,
  getTransactions,
  saveTransactions,
  generateId,
} from "../lib/dataStore";

const CreateProductSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().min(0).default(0),
  unitPrice: z.number().min(0).default(0),
  unit: z.string().default("pcs"),
  category: z.string().optional(),
  isRawMaterial: z.boolean().default(false),
});

const UpdateProductSchema = CreateProductSchema.partial();

export const getProductsHandler: RequestHandler = async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductByCodeHandler: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;
    const products = await getProducts();
    const product = products.find((p) => p.code === code);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by code:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const createProductHandler: RequestHandler = async (req, res) => {
  try {
    const data = CreateProductSchema.parse(req.body);
    const products = await getProducts();

    // Check if code already exists
    if (products.some((p) => p.code === data.code)) {
      return res.status(400).json({ error: "Product code already exists" });
    }

    const newProduct = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await saveProducts(products);

    // Create initial transaction
    const transactions = await getTransactions();
    transactions.push({
      id: generateId(),
      type: "ADJUSTMENT",
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      productId: newProduct.id,
      reference: "INITIAL_STOCK",
      notes: "Product created",
      createdAt: new Date().toISOString(),
    });
    await saveTransactions(transactions);

    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

export const updateProductHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = UpdateProductSchema.parse(req.body);
    const products = await getProducts();

    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if code already exists (exclude current product)
    if (
      data.code &&
      products.some((p) => p.code === data.code && p.id !== id)
    ) {
      return res.status(400).json({ error: "Product code already exists" });
    }

    products[productIndex] = {
      ...products[productIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await saveProducts(products);
    res.json(products[productIndex]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProductHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await getProducts();

    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    products.splice(productIndex, 1);
    await saveProducts(products);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const adjustInventoryHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;

    if (typeof quantity !== "number") {
      return res.status(400).json({ error: "Quantity must be a number" });
    }

    const products = await getProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[productIndex];
    const newQuantity = product.quantity + quantity;

    if (newQuantity < 0) {
      return res.status(400).json({ error: "Insufficient inventory" });
    }

    // Update product quantity
    products[productIndex].quantity = newQuantity;
    products[productIndex].updatedAt = new Date().toISOString();

    await saveProducts(products);

    // Create transaction record
    const transactions = await getTransactions();
    transactions.push({
      id: generateId(),
      type: "ADJUSTMENT",
      quantity,
      productId: id,
      notes,
      createdAt: new Date().toISOString(),
    });
    await saveTransactions(transactions);

    res.json(products[productIndex]);
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    res.status(500).json({ error: "Failed to adjust inventory" });
  }
};
