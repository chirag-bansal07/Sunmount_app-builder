import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const searchProductsByCode = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ message: 'Missing or invalid query' });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        product_code: {
          startsWith: query
        }
      },
      orderBy: { product_code: 'asc' }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search products' });
  }
};
