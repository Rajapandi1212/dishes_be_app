import { Router } from 'express';
import { getIngredients } from '../models/ingerdientModel';
import { authMiddleware } from '../utils/middlewares';

const router = Router();
router.get('/', authMiddleware, getIngredients);

export default router;
