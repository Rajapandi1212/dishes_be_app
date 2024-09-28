import { Router } from 'express';
import { listDishes } from '../models/dishModel';
const router = Router();
router.get('/dishes', listDishes);
export default router;
