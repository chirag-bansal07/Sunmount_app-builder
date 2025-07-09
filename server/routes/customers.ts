import { RequestHandler } from "express";
import { z } from "zod";
import {
  getCustomers,
  saveCustomers,
  getSuppliers,
  saveSuppliers,
  type Customer,
  type Supplier,
} from "../lib/customersStore";
import { generateId } from "../lib/dataStore";

const CustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
});

export const getCustomersHandler: RequestHandler = async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

export const createCustomerHandler: RequestHandler = async (req, res) => {
  try {
    const data = CustomerSchema.parse(req.body);
    const customers = await getCustomers();

    const newCustomer: Customer = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    await saveCustomers(customers);

    res.status(201).json(newCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

export const getSuppliersHandler: RequestHandler = async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

export const createSupplierHandler: RequestHandler = async (req, res) => {
  try {
    const data = CustomerSchema.parse(req.body);
    const suppliers = await getSuppliers();

    const newSupplier: Supplier = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    suppliers.push(newSupplier);
    await saveSuppliers(suppliers);

    res.status(201).json(newSupplier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
};
