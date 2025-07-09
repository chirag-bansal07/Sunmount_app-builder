// src/routes/suppliers.ts
import { Router } from 'express';
import { getSuppliers, createSupplier } from '../controllers/supplierController';

const router = Router();

router.get('/', getSuppliers);
router.post('/', createSupplier);

export default router;
