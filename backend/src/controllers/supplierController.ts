import { Request, Response } from 'express';

export const getSuppliers = (req: Request, res: Response) => {
  const dummySuppliers = [
    {
      id: 'SUP-001',
      name: 'Global Supplies Inc.',
      email: 'contact@globalsupplies.com',
      phone: '987-654-3210',
      address: '456 Supplier Ave, Commerce City',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  res.json(dummySuppliers);
};

export const createSupplier = (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;
  const newSupplier = {
    id: `SUP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    name,
    email,
    phone,
    address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.status(201).json(newSupplier);
};
