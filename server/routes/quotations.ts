import { RequestHandler } from "express";
import { z } from "zod";
import {
  getQuotations,
  saveQuotations,
  getOrders,
  saveOrders,
  generateOrderNumber,
  type Quotation,
} from "../lib/ordersStore";
import { getCustomers, saveCustomers } from "../lib/customersStore";
import { generateId } from "../lib/dataStore";

const QuotationItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productCode: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
});

const CreateQuotationSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  items: z.array(QuotationItemSchema).min(1),
  notes: z.string().optional(),
});

export const getQuotationsHandler: RequestHandler = async (req, res) => {
  try {
    const quotations = await getQuotations();
    res.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ error: "Failed to fetch quotations" });
  }
};

export const createQuotationHandler: RequestHandler = async (req, res) => {
  try {
    const data = CreateQuotationSchema.parse(req.body);
    const quotations = await getQuotations();
    const customers = await getCustomers();

    const items = data.items.map((item) => ({
      ...item,
      id: generateId(),
      totalPrice: item.quantity * item.unitPrice,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Auto-create customer if not exists
    const existingCustomer = customers.find(
      (c) =>
        c.name.toLowerCase() === data.customerName.toLowerCase() ||
        (data.customerEmail && c.email === data.customerEmail),
    );

    if (!existingCustomer && data.customerName) {
      const newCustomer = {
        id: generateId(),
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      customers.push(newCustomer);
      await saveCustomers(customers);
    }

    const newQuotation: Quotation = {
      id: generateId(),
      quotationNumber: generateOrderNumber("QT"),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      items,
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes,
    };

    quotations.push(newQuotation);
    await saveQuotations(quotations);

    res.status(201).json(newQuotation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating quotation:", error);
    res.status(500).json({ error: "Failed to create quotation" });
  }
};

export const updateQuotationHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const quotations = await getQuotations();
    const quotationIndex = quotations.findIndex((q) => q.id === id);

    if (quotationIndex === -1) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    quotations[quotationIndex] = {
      ...quotations[quotationIndex],
      status,
      notes,
      updatedAt: new Date().toISOString(),
    };

    await saveQuotations(quotations);
    res.json(quotations[quotationIndex]);
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({ error: "Failed to update quotation" });
  }
};

export const moveToOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const quotations = await getQuotations();
    const orders = await getOrders();

    const quotationIndex = quotations.findIndex((q) => q.id === id);
    if (quotationIndex === -1) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    const quotation = quotations[quotationIndex];
    if (quotation.status !== "approved" && quotation.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Quotation must be approved to move to orders" });
    }

    // Create new order from quotation
    const newOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber("ORD"),
      quotationId: quotation.id,
      customerName: quotation.customerName,
      customerEmail: quotation.customerEmail,
      customerPhone: quotation.customerPhone,
      items: quotation.items,
      totalAmount: quotation.totalAmount,
      status: "current" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: quotation.notes,
    };

    // Remove quotation and add order
    quotations.splice(quotationIndex, 1);
    orders.push(newOrder);

    await Promise.all([saveQuotations(quotations), saveOrders(orders)]);

    res.json(newOrder);
  } catch (error) {
    console.error("Error moving quotation to orders:", error);
    res.status(500).json({ error: "Failed to move quotation to orders" });
  }
};

export const deleteQuotationHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const quotations = await getQuotations();

    const quotationIndex = quotations.findIndex((q) => q.id === id);
    if (quotationIndex === -1) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    quotations.splice(quotationIndex, 1);
    await saveQuotations(quotations);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ error: "Failed to delete quotation" });
  }
};
