import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RawMaterial = {
  product_code: string;
  quantity: number;
};

type OutputProduct = {
  product_code: string;
  quantity: number;
};

interface CreateBatchRequest {
  batch_number: string;
  raw_materials: RawMaterial[];
  output: OutputProduct[];
  status: string;
  start_date: string;
}

/**
 * Create a new WIP batch
 * 1. Validates all input data
 * 2. Checks raw material availability
 * 3. Deducts raw materials from inventory
 * 4. Creates WIP batch record
 */
export const createBatch = async (req: Request, res: Response) => {
  try {
    console.log("📥 Received WIP batch request");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      batch_number,
      raw_materials,
      output,
      status,
      start_date,
    }: CreateBatchRequest = req.body;

    console.log("🔄 Creating WIP batch:", {
      batch_number,
      raw_materials: raw_materials?.length || 0,
      output: output?.length || 0,
      status,
      start_date,
    });

    // Input validation
    if (
      !batch_number ||
      typeof batch_number !== "string" ||
      batch_number.trim() === ""
    ) {
      return res.status(400).json({
        error: "Batch number is required and must be a non-empty string",
      });
    }

    if (!Array.isArray(raw_materials) || raw_materials.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one raw material is required" });
    }

    if (!Array.isArray(output)) {
      return res.status(400).json({ error: "Output must be an array" });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }

    if (!start_date) {
      return res.status(400).json({ error: "Start date is required" });
    }

    // Validate start_date format
    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "Invalid start date format" });
    }

    // Check if batch number already exists
    const existingBatch = await prisma.workInProgress.findUnique({
      where: { batch_number: batch_number.trim() },
    });

    if (existingBatch) {
      return res
        .status(409)
        .json({ error: `Batch number '${batch_number}' already exists` });
    }

    // Validate raw materials
    for (let i = 0; i < raw_materials.length; i++) {
      const material = raw_materials[i];

      if (!material || typeof material !== "object") {
        return res
          .status(400)
          .json({ error: `Raw material at index ${i} is invalid` });
      }

      if (!material.product_code || typeof material.product_code !== "string") {
        return res.status(400).json({
          error: `Raw material at index ${i} must have a valid product_code`,
        });
      }

      if (typeof material.quantity !== "number" || material.quantity <= 0) {
        return res.status(400).json({
          error: `Raw material at index ${i} must have a positive quantity`,
        });
      }
    }

    // Validate output products
    for (let i = 0; i < output.length; i++) {
      const product = output[i];

      if (!product || typeof product !== "object") {
        return res
          .status(400)
          .json({ error: `Output product at index ${i} is invalid` });
      }

      if (!product.product_code || typeof product.product_code !== "string") {
        return res.status(400).json({
          error: `Output product at index ${i} must have a valid product_code`,
        });
      }

      if (
        typeof product.quantity !== "number" ||
        product.quantity <= 0 ||
        false
      ) {
        return res.status(400).json({
          error: `Output product at index ${i} must have a positive integer quantity`,
        });
      }
    }

    // Execute transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      console.log("📦 Processing raw materials...");

      // Check and deduct raw materials
      for (const material of raw_materials) {
        const product = await tx.product.findUnique({
          where: { product_code: material.product_code },
        });

        if (!product) {
          throw new Error(
            `Raw material '${material.product_code}' not found in inventory`,
          );
        }

        if (product.quantity < material.quantity) {
          throw new Error(
            `Insufficient stock for '${material.product_code}': ` +
              `requested ${material.quantity}, available ${product.quantity}`,
          );
        }

        // Deduct from inventory
        await tx.product.update({
          where: { product_code: material.product_code },
          data: {
            quantity: product.quantity - material.quantity,
            last_updated: new Date(),
          },
        });

        console.log(
          `✅ Deducted ${material.quantity} units of ${material.product_code}`,
        );
      }

      // Create WIP batch
      const newBatch = await tx.workInProgress.create({
        data: {
          batch_number: batch_number.trim(),
          raw_materials: raw_materials,
          output: output,
          status: status,
          start_date: startDate,
        },
      });

      console.log("✅ WIP batch created successfully:", newBatch.batch_number);
      return newBatch;
    });

    res.status(201).json({
      message: `WIP batch '${batch_number}' created successfully`,
      batch: {
        id: result.id,
        batch_number: result.batch_number,
        status: result.status,
        start_date: result.start_date,
        raw_materials_count: raw_materials.length,
        output_count: output.length,
      },
    });
  } catch (error: any) {
    console.error("❌ WIP batch creation error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500),
    });

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Batch number already exists" });
    }

    res.status(500).json({
      error: error.message || "Failed to create WIP batch",
    });
  }
};

/**
 * Get all WIP batches
 */
export const getAllBatches = async (_req: Request, res: Response) => {
  try {
    console.log("📋 Fetching all WIP batches...");

    const batches = await prisma.workInProgress.findMany({
      orderBy: { start_date: "desc" },
    });

    console.log(`✅ Found ${batches.length} WIP batches`);
    res.json(batches);
  } catch (error: any) {
    console.error("❌ Failed to fetch WIP batches:", error);
    res.status(500).json({ error: "Failed to fetch WIP batches" });
  }
};

/**
 * Update WIP batch (mainly for completion)
 * 1. Updates batch status and end date
 * 2. If completing, adds output products to inventory
 */
export const updateBatch = async (req: Request, res: Response) => {
  try {
    const { batch_number } = req.params;
    const { status, end_date, output } = req.body;

    console.log(`🔄 Updating WIP batch ${batch_number}:`, {
      status,
      end_date,
      output,
    });

    if (!batch_number) {
      return res.status(400).json({ error: "Batch number is required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Validate output if completing
    if (status === "completed") {
      if (!Array.isArray(output) || output.length === 0) {
        return res.status(400).json({
          error: "Output products are required when completing a batch",
        });
      }

      for (let i = 0; i < output.length; i++) {
        const product = output[i];

        if (!product || typeof product !== "object") {
          return res
            .status(400)
            .json({ error: `Output product at index ${i} is invalid` });
        }

        if (!product.product_code || typeof product.product_code !== "string") {
          return res.status(400).json({
            error: `Output product at index ${i} must have a valid product_code`,
          });
        }

        if (typeof product.quantity !== "number" || product.quantity <= 0) {
          return res.status(400).json({
            error: `Output product at index ${i} must have a positive quantity`,
          });
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if batch exists
      const existingBatch = await tx.workInProgress.findUnique({
        where: { batch_number },
      });

      if (!existingBatch) {
        throw new Error(`WIP batch '${batch_number}' not found`);
      }

      // Update batch
      const updateData: any = {
        status,
        end_date: end_date ? new Date(end_date) : new Date(),
      };

      if (output) {
        updateData.output = output;
      }

      const updatedBatch = await tx.workInProgress.update({
        where: { batch_number },
        data: updateData,
      });

      // If completing, add output to inventory
      if (status === "completed" && Array.isArray(output)) {
        console.log("📦 Adding output products to inventory...");

        for (const item of output) {
          const existing = await tx.product.findUnique({
            where: { product_code: item.product_code },
          });

          if (existing) {
            // Update existing product
            await tx.product.update({
              where: { product_code: item.product_code },
              data: {
                quantity: existing.quantity + item.quantity,
                last_updated: new Date(),
              },
            });
            console.log(
              `✅ Added ${item.quantity} units to existing product ${item.product_code}`,
            );
          } else {
            // Create new product
            await tx.product.create({
              data: {
                product_code: item.product_code,
                name: item.product_code,
                description: "Auto-generated from WIP completion",
                weight: 0,
                price: 0,
                quantity: item.quantity,
                last_updated: new Date(),
              },
            });
            console.log(
              `✅ Created new product ${item.product_code} with ${item.quantity} units`,
            );
          }
        }
      }

      return updatedBatch;
    });

    res.status(200).json({
      message: `WIP batch '${batch_number}' updated successfully`,
      batch: {
        id: result.id,
        batch_number: result.batch_number,
        status: result.status,
        end_date: result.end_date,
      },
    });
  } catch (error: any) {
    console.error("❌ WIP batch update error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: error.message || "Failed to update WIP batch",
    });
  }
};
