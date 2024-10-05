import { Router } from 'express';
import dishRouter from './dishRouter';
import ingredientRouter from './ingredientRoute';
import userRouter from './userRouter';

const router = Router();
router.use('/dishes', dishRouter);
router.use('/ingredients', ingredientRouter);
router.use('/users', userRouter);
export default router;
