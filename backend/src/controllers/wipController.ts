import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RawItem = { product_code: string; quantity: number };
type OutputItem = { product_code: string; quantity: number };

export const createBatch = async (req: Request, res: Response) => {
  const {
    batch_number,
    raw_materials,
    output,
    product_code,
    status,
    start_date,
  } = req.body;

  try {
    const batch = await prisma.$transaction(async (tx) => {
      // ✅ Step 1: Validate and deduct raw materials
      if (!Array.isArray(raw_materials)) {
        throw new Error("raw_materials must be an array");
      }

      for (const item of raw_materials as RawItem[]) {
        if (
          !item ||
          typeof item.product_code !== "string" ||
          typeof item.quantity !== "number"
        ) {
          throw new Error(`Invalid raw material item: ${JSON.stringify(item)}`);
        }

        const product = await tx.product.findUnique({
          where: { product_code: item.product_code },
        });

        if (!product) {
          throw new Error(`Raw material '${item.product_code}' not found.`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for '${item.product_code}': requested ${item.quantity}, available ${product.quantity}`,
          );
        }

        await tx.product.update({
          where: { product_code: item.product_code },
          data: {
            quantity: product.quantity - item.quantity,
            last_updated: new Date(),
          },
        });
      }

      // ✅ Step 2: Create the batch after deduction succeeds
      const newBatch = await tx.workInProgress.create({
        data: {
          batch_number,
          raw_materials,
          output,
          product_code,
          status,
          start_date: new Date(start_date),
        },
      });

      return newBatch;
    });

    res.status(201).json({
      message: `Batch '${batch_number}' created successfully and raw materials deducted.`,
      batch,
    });
  } catch (error: any) {
    console.error("❌ Batch creation error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create WIP batch" });
  }
};

export const getAllBatches = async (_req: Request, res: Response) => {
  const batches = await prisma.workInProgress.findMany({
    include: { product: true },
  });

  res.json(batches);
};

export const updateBatch = async (req: Request, res: Response) => {
  const { batch_number } = req.params;
  const { status, end_date, output } = req.body;

  try {
    const updatedBatch = await prisma.$transaction(async (tx) => {
      // Step 1: Update the batch status and end date
      const batch = await tx.workInProgress.update({
        where: { batch_number },
        data: {
          status,
          end_date: end_date ? new Date(end_date) : new Date(),
        },
      });

      // Step 2: If completing the batch, update inventory
      if (status === "completed") {
        const outputItems = batch.output as OutputItem[];

        if (!Array.isArray(outputItems)) {
          throw new Error("Output must be a valid array");
        }

        for (const item of outputItems) {
          if (
            !item ||
            typeof item.product_code !== "string" ||
            typeof item.quantity !== "number"
          ) {
            throw new Error(`Invalid output item: ${JSON.stringify(item)}`);
          }

          const product = await tx.product.findUnique({
            where: { product_code: item.product_code },
          });

          if (!product) {
            throw new Error(
              `Product '${item.product_code}' not found in inventory`,
            );
          }

          await tx.product.update({
            where: { product_code: item.product_code },
            data: {
              quantity: product.quantity + item.quantity,
              last_updated: new Date(),
            },
          });
        }
      }

      return batch;
    });

    res.status(200).json({
      message: `Batch '${batch_number}' updated successfully`,
      batch: updatedBatch,
    });
  } catch (error: any) {
    console.error("❌ Batch update error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update WIP batch" });
  }
};
