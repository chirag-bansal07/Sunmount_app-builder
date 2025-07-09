import express from 'express';
import {
  getQuotations,
  updateQuotationStatus,
  createQuotation,
  deleteQuotation,
  cleanAllQuotations
} from '../controllers/quotationController';

const router = express.Router();

// GET all quotations (status: 'quotation')
router.get('/', getQuotations);

// POST to update quotation status (packing, completed, dispatched)
router.post('/update-status', updateQuotationStatus);
router.post('/create', createQuotation);
router.delete('/api/quotations/:orderId', deleteQuotation);
router.delete('/api/quotations/cleanup/all', cleanAllQuotations);

export default router;
