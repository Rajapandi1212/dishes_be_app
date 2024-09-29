import { Router } from 'express';
import {
  autoSuggestion,
  dishSuggestion,
  listDishes,
} from '../models/dishModel';
const router = Router();
router.get('/', listDishes);
router.get('/suggest', dishSuggestion);
router.get('/autoSuggest', autoSuggestion);
export default router;
