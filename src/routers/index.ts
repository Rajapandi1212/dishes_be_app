import { Router } from 'express';
import dishRouter from './dishRouter';

const router = Router();
router.use('/dishes', dishRouter);
export default router;
