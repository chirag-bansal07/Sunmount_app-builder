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
      const currentOrders = await prisma.order.findMany({
        where: {
          status: {
            in: ["packing", "ready"],
          },
        },
      });

      const enriched = await Promise.all(
        currentOrders.map(async (order) => {
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

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Current Orders API error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  } finally {
    await prisma.$disconnect();
  }
}
