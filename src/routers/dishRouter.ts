import { Router } from 'express';
import {
  autoSuggestion,
  dishSuggestion,
  getDish,
  listDishes,
} from '../models/dishModel';
const router = Router();
router.get('/', listDishes);
router.get('/suggest', dishSuggestion);
router.get('/autoSuggest', autoSuggestion);
router.get('/:id', getDish);
export default router;
