import { RequestHandler } from "express";
import { z } from "zod";
import {
  getWipBatches,
  saveWipBatches,
  getProducts,
  saveProducts,
  getTransactions,
  saveTransactions,
  generateId,
} from "../lib/dataStore";

const CreateWipBatchSchema = z.object({
  batchNumber: z.string().min(1),
  notes: z.string().optional(),
  materials: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(0),
    }),
  ),
});

const CompleteWipBatchSchema = z.object({
  outputs: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(0),
    }),
  ),
});

export const getWipBatchesHandler: RequestHandler = async (req, res) => {
  try {
    const batches = await getWipBatches();
    res.json(batches);
  } catch (error) {
    console.error("Error fetching WIP batches:", error);
    res.status(500).json({ error: "Failed to fetch WIP batches" });
  }
};

export const createWipBatchHandler: RequestHandler = async (req, res) => {
  try {
    const data = CreateWipBatchSchema.parse(req.body);
    const products = await getProducts();
    const batches = await getWipBatches();

    // Check if batch number already exists
    if (batches.some((b) => b.batchNumber === data.batchNumber)) {
      return res.status(400).json({ error: "Batch number already exists" });
    }

    // Check if all materials have sufficient inventory
    for (const material of data.materials) {
      const product = products.find((p) => p.id === material.productId);

      if (!product) {
        return res.status(400).json({
          error: `Product with ID ${material.productId} not found`,
        });
      }

      if (product.quantity < material.quantity) {
        return res.status(400).json({
          error: `Insufficient inventory for ${product.name}. Available: ${product.quantity}, Required: ${material.quantity}`,
        });
      }
    }

    // Create new batch
    const newBatch = {
      id: generateId(),
      batchNumber: data.batchNumber,
      status: "IN_PROGRESS",
      startDate: new Date().toISOString(),
      notes: data.notes,
      materials: data.materials.map((material) => {
        const product = products.find((p) => p.id === material.productId)!;
        return {
          id: generateId(),
          quantity: material.quantity,
          product,
        };
      }),
      outputs: [],
    };

    // Update product quantities and create transactions
    const transactions = await getTransactions();

    for (const material of data.materials) {
      const productIndex = products.findIndex(
        (p) => p.id === material.productId,
      );
      products[productIndex].quantity -= material.quantity;
      products[productIndex].updatedAt = new Date().toISOString();

      // Create transaction record
      transactions.push({
        id: generateId(),
        type: "WIP_INPUT",
        quantity: -material.quantity,
        productId: material.productId,
        reference: data.batchNumber,
        notes: "Materials used in production",
        createdAt: new Date().toISOString(),
      });
    }

    batches.push(newBatch);

    await Promise.all([
      saveWipBatches(batches),
      saveProducts(products),
      saveTransactions(transactions),
    ]);

    res.status(201).json(newBatch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating WIP batch:", error);
    res.status(500).json({ error: "Failed to create WIP batch" });
  }
};

export const completeWipBatchHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = CompleteWipBatchSchema.parse(req.body);

    const batches = await getWipBatches();
    const products = await getProducts();

    const batchIndex = batches.findIndex((b) => b.id === id);
    if (batchIndex === -1) {
      return res.status(404).json({ error: "WIP batch not found" });
    }

    const batch = batches[batchIndex];
    if (batch.status !== "IN_PROGRESS") {
      return res.status(400).json({ error: "Batch is not in progress" });
    }

    // Update batch status and add outputs
    batch.status = "COMPLETED";
    batch.endDate = new Date().toISOString();
    batch.outputs = data.outputs.map((output) => {
      const product = products.find((p) => p.id === output.productId)!;
      return {
        id: generateId(),
        quantity: output.quantity,
        product,
      };
    });

    // Update product quantities and create transactions
    const transactions = await getTransactions();

    for (const output of data.outputs) {
      const productIndex = products.findIndex((p) => p.id === output.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity += output.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }

      // Create transaction record
      transactions.push({
        id: generateId(),
        type: "WIP_OUTPUT",
        quantity: output.quantity,
        productId: output.productId,
        reference: batch.batchNumber,
        notes: "Products completed from batch",
        createdAt: new Date().toISOString(),
      });
    }

    await Promise.all([
      saveWipBatches(batches),
      saveProducts(products),
      saveTransactions(transactions),
    ]);

    res.json(batch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error completing WIP batch:", error);
    res.status(500).json({ error: "Failed to complete WIP batch" });
  }
};
