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
      const wipBatches = await prisma.workInProgress.findMany({
        orderBy: { start_date: "desc" },
      });
      return res.json(wipBatches);
    }

    if (req.method === "POST") {
      const { batch_number, raw_materials, output, status, start_date } =
        req.body;

      const newBatch = await prisma.workInProgress.create({
        data: {
          batch_number,
          raw_materials,
          output,
          status,
          start_date: new Date(start_date),
        },
      });

      return res.status(201).json(newBatch);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("WIP API error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  } finally {
    await prisma.$disconnect();
  }
}
