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
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(customers);
    }

    if (req.method === "POST") {
      const { id, name, email, phone, address } = req.body;

      const newCustomer = await prisma.customer.create({
        data: {
          id,
          name,
          email,
          phone,
          address,
        },
      });

      return res.status(201).json(newCustomer);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Customers API error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  } finally {
    await prisma.$disconnect();
  }
}
