import { Router } from 'express';
import { getIngredients } from '../models/ingerdientModel';
import { authMiddleware } from '../utils/middlewares';

const router = Router();
router.get('/', getIngredients);

export default router;
