// src/routes/customers.ts
import { Router } from 'express';
import { getCustomers, createCustomer, deleteCustomer } from '../controllers/customerController';

const router = Router();

router.get('/', getCustomers);
router.post('/', createCustomer);
router.post('/delete', deleteCustomer);


export default router;
