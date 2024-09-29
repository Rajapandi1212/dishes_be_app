import { Router } from 'express';
import { getIngredients } from '../models/ingerdientModel';

const router = Router();
router.get('/', getIngredients);

export default router;
