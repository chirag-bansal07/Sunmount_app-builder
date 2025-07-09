import { Router } from "express";
import {
  getInventory,
  manualUpdateInventory,
  addProduct,
  updateProduct,
} from "../controllers/inventoryController";

const router = Router();

router.get("/", getInventory);
router.post("/update", manualUpdateInventory);
router.post("/", addProduct);
router.put("/:product_code", updateProduct);

export default router;
