import { RequestHandler } from "express";
import { z } from "zod";
import {
  getPurchases,
  savePurchases,
  getOrders,
  saveOrders,
  generateOrderNumber,
  type Purchase,
} from "../lib/ordersStore";
import {
  getProducts,
  saveProducts,
  getTransactions,
  saveTransactions,
  generateId,
} from "../lib/dataStore";

const PurchaseItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productCode: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
});

const CreatePurchaseSchema = z.object({
  supplierName: z.string().min(1),
  supplierEmail: z.string().email().optional(),
  supplierPhone: z.string().optional(),
  items: z.array(PurchaseItemSchema).min(1),
  notes: z.string().optional(),
});

export const getPurchasesHandler: RequestHandler = async (req, res) => {
  try {
    const purchases = await getPurchases();
    res.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
};

export const createPurchaseHandler: RequestHandler = async (req, res) => {
  try {
    const data = CreatePurchaseSchema.parse(req.body);
    const purchases = await getPurchases();

    const items = data.items.map((item) => ({
      ...item,
      id: generateId(),
      totalPrice: item.quantity * item.unitPrice,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const newPurchase: Purchase = {
      id: generateId(),
      purchaseNumber: generateOrderNumber("PO"),
      supplierName: data.supplierName,
      supplierEmail: data.supplierEmail,
      supplierPhone: data.supplierPhone,
      items,
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes,
    };

    purchases.push(newPurchase);
    await savePurchases(purchases);

    res.status(201).json(newPurchase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating purchase:", error);
    res.status(500).json({ error: "Failed to create purchase" });
  }
};

export const completePurchaseHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const purchases = await getPurchases();
    const products = await getProducts();
    const orders = await getOrders();
    const transactions = await getTransactions();

    const purchaseIndex = purchases.findIndex((p) => p.id === id);
    if (purchaseIndex === -1) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const purchase = purchases[purchaseIndex];
    if (purchase.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending purchases can be completed" });
    }

    // Update inventory for each purchased item
    for (const item of purchase.items) {
      const productIndex = products.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity += item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();

        // Create transaction record
        transactions.push({
          id: generateId(),
          type: "PURCHASE",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productId: item.productId,
          reference: purchase.purchaseNumber,
          notes: `Purchase from ${purchase.supplierName}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Mark purchase as completed and move to order history
    const completedPurchase = {
      ...purchase,
      status: "completed" as const,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove from purchases and add to order history
    purchases.splice(purchaseIndex, 1);
    orders.push({
      id: generateId(),
      orderNumber: purchase.purchaseNumber,
      quotationId: undefined,
      customerName: purchase.supplierName,
      customerEmail: purchase.supplierEmail,
      customerPhone: purchase.supplierPhone,
      items: purchase.items,
      totalAmount: purchase.totalAmount,
      status: "dispatched",
      createdAt: purchase.createdAt,
      updatedAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      notes: `Purchase completed: ${purchase.notes || ""}`,
    });

    await Promise.all([
      savePurchases(purchases),
      saveProducts(products),
      saveOrders(orders),
      saveTransactions(transactions),
    ]);

    res.json(completedPurchase);
  } catch (error) {
    console.error("Error completing purchase:", error);
    res.status(500).json({ error: "Failed to complete purchase" });
  }
};

export const deletePurchaseHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const purchases = await getPurchases();

    const purchaseIndex = purchases.findIndex((p) => p.id === id);
    if (purchaseIndex === -1) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    purchases.splice(purchaseIndex, 1);
    await savePurchases(purchases);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ error: "Failed to delete purchase" });
  }
};
