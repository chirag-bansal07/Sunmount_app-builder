import { Router } from 'express';
import {
  createBatch,
  getAllBatches,
  updateBatch
} from '../controllers/wipController';

const router = Router();

router.post('/', createBatch);
router.get('/', getAllBatches);
router.put('/:batch_number', updateBatch);

export default router;
