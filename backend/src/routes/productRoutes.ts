import { Router } from "express";
import {
  searchProductsByCode,
  deleteProduct,
} from "../controllers/productController";
const router = Router();

router.get("/search", searchProductsByCode);
router.delete("/:product_code", deleteProduct);
export default router;
