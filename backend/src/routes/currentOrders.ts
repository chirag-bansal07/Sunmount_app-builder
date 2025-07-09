import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fetchCustomerForOrder } from '../controllers/customerController'; // ✅ make sure this is correct

const prisma = new PrismaClient();
const router = express.Router();

// GET all current sales orders (status: 'packing')
router.get('/', async (_req, res) => {
  try {
    const currentSales = await prisma.order.findMany({
      where: {
        type: 'sales',
        status: 'packing'
      }
    });

    const enriched = await Promise.all(
      currentSales.map(async (order) => {
        const customer = await fetchCustomerForOrder(order.party_id);
        return {
          ...order,
          customerName: customer?.name || 'Unknown',
          customerPhone: customer?.phone || '',
          customerAddress: customer?.address || ''
        };
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error('[currentOrders] Error:', err);
    res.status(500).json({ error: 'Failed to fetch current orders' });
  }
});

export default router;
