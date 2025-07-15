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
    status,
    start_date,
  } = req.body;

  try {
    const batch = await prisma.$transaction(async (tx) => {
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

      const newBatch = await tx.workInProgress.create({
        data: {
          batch_number,
          raw_materials,
          output,
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
    res.status(500).json({ error: error.message || "Failed to create WIP batch" });
  }
};

// server/controllers/wipController.ts

export const getAllBatches = async (_req: Request, res: Response) => {
  try {
    // 1. Fetch raw WIP batches
    const batches = await prisma.workInProgress.findMany()

    // 2. Collect every product_code referenced
    const codes = new Set<string>()
    batches.forEach(b => {
      ;(b.raw_materials as { product_code: string }[])
        .forEach(rm => codes.add(rm.product_code))
      ;(b.output as { product_code: string }[])
        .forEach(op => codes.add(op.product_code))
    })

    // 3. Pull back only code + name from your Product table
    const products = await prisma.product.findMany({
      where: { product_code: { in: Array.from(codes) } },
      select: { product_code: true, name: true },
    })
    const nameMap = products.reduce<Record<string, string>>((m, p) => {
      m[p.product_code] = p.name
      return m
    }, {})

    // 4. Re‐emit batches, injecting `name` into each item
    const enriched = batches.map(b => ({
      ...b,
      raw_materials: (b.raw_materials as any[]).map(rm => ({
        product_code: rm.product_code,
        quantity: rm.quantity,
        name: nameMap[rm.product_code] || "",   // ← added
      })),
      output: (b.output as any[]).map(op => ({
        product_code: op.product_code,
        quantity: op.quantity,
        name: nameMap[op.product_code] || "",    // ← added
      })),
    }))

    return res.json(enriched)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

export const updateBatch = async (req: Request, res: Response) => {
  const { batch_number } = req.params;
  const { status, end_date } = req.body;

  try {
    const updatedBatch = await prisma.$transaction(async (tx) => {
      const batch = await tx.workInProgress.findUnique({
        where: { batch_number },
      });

      if (!batch) {
        throw new Error(`Batch '${batch_number}' not found`);
      }

      const updateData: any = {
        status,
        end_date: end_date ? new Date(end_date) : new Date(),
      };

      const updated = await tx.workInProgress.update({
        where: { batch_number },
        data: updateData,
      });

      if (status === "completed") {
        const outputItems = batch.output as OutputItem[];

        if (!Array.isArray(outputItems)) {
          throw new Error("Output must be a valid array");
        }

        for (const item of outputItems) {
          if (
            !item ||
            typeof item.product_code !== "string" ||
            typeof item.quantity !== "number" ||
            isNaN(item.quantity)
          ) {
            throw new Error(`Invalid output item: ${JSON.stringify(item)}`);
          }

          if (item.quantity <= 0) {
            throw new Error(
              `Output quantity must be positive for '${item.product_code}': ${item.quantity}`,
            );
          }

          const existing = await tx.product.findUnique({
            where: { product_code: item.product_code },
          });

          if (existing) {
            await tx.product.update({
              where: { product_code: item.product_code },
              data: {
                quantity: existing.quantity + item.quantity,
                last_updated: new Date(),
              },
            });
          } else {
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
          }
        }
      }

      return updated;
    });

    res.status(200).json({
      message: `Batch '${batch_number}' updated successfully`,
      batch: updatedBatch,
    });
  } catch (error: any) {
    console.error("❌ Batch update error:", error);
    res.status(500).json({ error: error.message || "Failed to update WIP batch" });
  }
};
