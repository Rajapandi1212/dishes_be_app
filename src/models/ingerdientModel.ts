import { Request, Response } from 'express';
import { executeQuery } from '../utils/query';
import { cache } from '../utils/cache';

export const getIngredients = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'all_ingredients';
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      res.status(200).json(cachedValue);
      return;
    }
    const query = `
        SELECT *
        FROM ingredients
        ORDER BY name ASC;
      `;
    const response = await executeQuery(query);
    cache.set(cacheKey, response);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    const message = error?.message || 'Error occured';
    console.error(message, error);
    res.status(400).json({ success: false, message, error });
    return;
  }
};
