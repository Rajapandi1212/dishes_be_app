import { Router } from 'express';
import dishRouter from './dishRouter';
import ingredientRouter from './ingredientRoute';

const router = Router();
router.use('/dishes', dishRouter);
router.use('/ingredients', ingredientRouter);
export default router;
