// ✅ inventoryService.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const updateInventoryQuantity = async (
  product_code: string,
  qtyDelta: number,
  productDetails?: {
    name?: string;
    description?: string;
    weight?: number;
    price?: number;
  },
) => {
  const product = await prisma.product.findUnique({
    where: { product_code },
  });

  if (!product) {
    return prisma.product.create({
      data: {
        product_code,
        name: productDetails?.name || "Unnamed Product",
        description: productDetails?.description || "",
        weight: productDetails?.weight || 1,
        price: productDetails?.price || 0,
        quantity: qtyDelta,
        last_updated: new Date(),
      },
    });
  }

  const newQuantity = product.quantity + qtyDelta;

  return prisma.product.update({
    where: { product_code },
    data: {
      quantity: newQuantity,
      last_updated: new Date(),
    },
  });
};
export const updateInventory = async (products: any[], isPurchase: boolean) => {
  for (const p of products) {
    const existing = await prisma.product.findUnique({
      where: { product_code: p.product_code },
    });

    const deltaQty = isPurchase
      ? (p.quantity_received ?? 0)
      : -(p.quantity ?? 0); // 👈 sales subtract

    if (existing) {
      const newQuantity = Math.max(0, existing.quantity + deltaQty); // ✅ prevent negative stock

      await prisma.product.update({
        where: { product_code: p.product_code },
        data: {
          quantity: newQuantity,
          last_updated: new Date(),
        },
      });
    } else if (isPurchase) {
      // ✅ Create product with complete details for purchases
      await prisma.product.create({
        data: {
          product_code: p.product_code,
          name: p.name || p.product_name || "Unnamed Product",
          description: p.description || "",
          weight: p.weight || 1,
          price: p.price || p.unit_price || 0,
          quantity: p.quantity_received ?? p.quantity ?? 0,
          last_updated: new Date(),
        },
      });
    }
  }
};
