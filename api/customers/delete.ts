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
    const { id } = req.body;

    const deleted = await prisma.customer.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Customer '${deleted.name}' deleted successfully`,
      deleted,
    });
  } catch (error: any) {
    console.error("Delete customer error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(500).json({ error: "Failed to delete customer" });
  } finally {
    await prisma.$disconnect();
  }
}
