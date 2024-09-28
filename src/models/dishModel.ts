import { Request, Response } from 'express';
import { executeQuery } from '../utils/query';
import { validOrderDirections, validSortByColumns } from '../utils/constants';

export const def = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true });
  } catch (error: any) {
    const message = error?.message || 'Error occured';
    console.error(message, error);
    res.status(400).json({ success: false, message, error });
  }
};

export const listDishes = async (req: Request, res: Response) => {
  try {
    const {
      limit = 10,
      sortBy = 'name',
      sortDirection = 'ASC',
    }: { limit?: number; sortBy?: string; sortDirection?: string } = req?.query;
    if (!validSortByColumns?.includes(sortBy)) {
      throw new Error(`Invalid sort column ${JSON.stringify(sortBy)}`);
    }
    if (!validOrderDirections?.includes(sortDirection?.toUpperCase())) {
      throw new Error('Invalid order direction');
    }
    const query = `
    SELECT *, (SELECT COUNT(*) FROM dishes) AS total_count
FROM dishes
ORDER BY ${sortBy} ${sortDirection}
LIMIT $1;
    `;
    const response = await executeQuery(query, [limit]);
    res.status(200).json(response);
  } catch (error: any) {
    const message = error?.message || 'Error occured while fetching dishes';
    // console.error(message, error);
    res.status(400).json({ success: false, message, error });
  }
};
