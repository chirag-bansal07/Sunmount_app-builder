import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all orders with status 'completed' (purchase) or 'dispatched' (sales)
router.get('/', async (_req, res) => {
  try {
    const history = await prisma.order.findMany({
      where: {
        OR: [
          { status: 'completed' },   // purchase
          { status: 'dispatched' }   // sales
        ]
      }
    });
    res.status(200).json(history);
  } catch {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

export default router;
