import { VercelRequest, VercelResponse } from "@vercel/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Utility function to fetch customer for order
const fetchCustomerForOrder = async (party_id: string) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: party_id },
    });
    return customer;
  } catch (err) {
    console.error("[fetchCustomerForOrder] Failed:", err);
    return null;
  }
};

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
      const quotations = await prisma.order.findMany({
        where: { status: "quotation" },
      });

      const enriched = await Promise.all(
        quotations.map(async (order) => {
          const customer = await fetchCustomerForOrder(order.party_id);
          return {
            ...order,
            customerName: customer?.name || "Unknown",
            customerPhone: customer?.phone || "",
            customerAddress: customer?.address || "",
          };
        }),
      );

      return res.json(enriched);
    }

    if (req.method === "POST") {
      const { order_id, party_id, type, products, notes, bom } = req.body;

      const newQuotation = await prisma.order.create({
        data: {
          order_id,
          type,
          party_id,
          products,
          bom,
          status: "quotation",
          date: new Date(),
          ...(notes && { notes }),
        },
      });

      return res.status(201).json(newQuotation);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Quotations API error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  } finally {
    await prisma.$disconnect();
  }
}
