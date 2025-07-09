import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { updateInventory } from '../services/inventoryService';
import { fetchCustomerForOrder } from './customerController';

const prisma = new PrismaClient();

type ProductUpdate = {
  product_code: string;
  quantity_received: number;
};
export const deleteQuotation = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    const deleted = await prisma.order.delete({
      where: { order_id: orderId },
    });

    return res.status(200).json({
      message: 'Quotation deleted successfully',
      data: deleted,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error deleting quotation:', errMsg);

    return res.status(500).json({
      message: 'Failed to delete quotation',
      error: errMsg,
    });
  }
};
export const cleanAllQuotations = async (_req: Request, res: Response) => {
  try {
    const deleted = await prisma.order.deleteMany({
      where: { status: 'quotation' }
    });

    res.status(200).json({
      message: `${deleted.count} quotations deleted.`,
      count: deleted.count
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error deleting quotations:', errMsg);
    res.status(500).json({
      message: 'Failed to delete all quotations',
      error: errMsg
    });
  }
};
// ✅ GET All Quotations (both purchase and sales)
export const getQuotations = async (_req: Request, res: Response) => {
  try {
    const quotations = await prisma.order.findMany({
      where: { status: 'quotation' }
    });

    const enriched = await Promise.all(
      quotations.map(async (order) => {
        const customer = await fetchCustomerForOrder(order.party_id);
        return {
          ...order,
          customerName: customer?.name || 'Unknown',
          customerPhone: customer?.phone || '',
          customerAddress: customer?.address || ''
        };
      })
    );

    res.json(enriched);
  } catch {
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const { order_id, party_id, type, products, notes, bom } = req.body;

    const newQuotation = await prisma.order.create({
      data: {
        order_id,
        type,
        party_id,
        products,
        bom,
        status: 'quotation',
        date: new Date(),
        ...(notes && { notes })
      }
    });

    res.status(201).json(newQuotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
};

// ✅ POST: Update Quotation Status Based on Order Type
export const updateQuotationStatus = async (req: Request, res: Response) => {
  try {
    const { order_id, status, updated_products }: {
      order_id: string;
      status?: string;
      updated_products?: ProductUpdate[];
    } = req.body;

    const order = await prisma.order.findUnique({ where: { order_id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let products = order.products as any[];

    /** ✅ Handle PURCHASE Orders **/
    if (order.type === 'purchase') {
      if (order.status === 'completed') {
        return res.status(400).json({ error: 'Order already marked as completed' });
      }

      if (updated_products && Array.isArray(updated_products)) {
        products = products.map((p: any) => {
          const match = updated_products.find((u: ProductUpdate) => u.product_code === p.product_code);
          if (!match) return p;

          const current = p.quantity_received || 0;
          const max = p.quantity_ordered;
          const newQty = Math.min(current + match.quantity_received, max);
          return { ...p, quantity_received: newQty };
        });

        const allReceived = products.every((p: any) => p.quantity_ordered === p.quantity_received);
        const updatedStatus = allReceived ? 'completed' : order.status;

        await prisma.order.update({
          where: { order_id },
          data: {
            products,
            status: updatedStatus
          }
        });

        if (allReceived) {
          await updateInventory(products, true);
        }

        return res.status(200).json({
          message: allReceived
            ? 'Purchase completed and inventory updated'
            : 'Partial quantities updated',
          status: updatedStatus
        });
      }

      if (status === 'completed') {
        products = products.map((p: any) => ({
          ...p,
          quantity_received: p.quantity_ordered
        }));

        await prisma.order.update({
          where: { order_id },
          data: {
            products,
            status: 'completed'
          }
        });

        await updateInventory(products, true);

        return res.status(200).json({
          message: 'Purchase force-completed and inventory updated'
        });
      }

      return res.status(400).json({ error: 'Invalid purchase update request' });
    }

    /** 🚚 SALES ORDER FLOW **/
    if (order.type === 'sales') {
      if (order.status === 'quotation' && status === 'packing') {
        await prisma.order.update({
          where: { order_id },
          data: { status: 'packing' }
        });

        return res.status(200).json({
          message: 'Sales order moved to current orders (packing)'
        });
      }

      if (order.status === 'packing' && status === 'dispatched') {
        await updateInventory(products, false);

        await prisma.order.update({
          where: { order_id },
          data: { status: 'dispatched' }
        });

        return res.status(200).json({
          message: 'Sales order dispatched and inventory updated'
        });
      }

      return res.status(400).json({ error: 'Invalid sales order transition' });
    }

    return res.status(400).json({ error: 'Unrecognized order type or transition' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
