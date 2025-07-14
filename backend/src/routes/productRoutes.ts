import { Router } from 'express';
import { searchProductsByCode } from '../controllers/productController';
const router = Router();

router.get('/search', searchProductsByCode);
export default router;
