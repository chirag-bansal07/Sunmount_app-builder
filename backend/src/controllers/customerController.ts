import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📦 GET all customers
export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(customers);
  } catch (err) {
    console.error('[getCustomers] Error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// ✍️ POST create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { id, name, email, phone, address } = req.body;

    const newCustomer = await prisma.customer.create({
      data: {
        id, // party_id
        name,
        email,
        phone,
        address
      }
    });

    res.status(201).json(newCustomer);
  } catch (err) {
    console.error('[createCustomer] Error:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};


// GET /api/customers/:id → fetch customer by party_id
export const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error('[getCustomerById] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Utility function (for use inside other controllers)
export const fetchCustomerForOrder = async (party_id: string) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: party_id } });
    return customer;
  } catch (err) {
    console.error('[fetchCustomerForOrder] Failed:', err);
    return null;
  }
};
export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const deleted = await prisma.customer.delete({
      where: { id }
    });

    res.status(200).json({
      message: `Customer '${deleted.name}' deleted successfully`,
      deleted
    });
  } catch (err: any) {
    console.error('[deleteCustomer] Error:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
