import { Request, Response } from 'express';
import { executeQuery } from '../utils/query';
import { validOrderDirections, validSortByColumns } from '../utils/constants';
import { cache } from '../utils/cache';
import { extractFilters, trimAndLower } from '../utils/helpers';

export const listDishes = async (req: Request, res: Response) => {
  try {
    const {
      limit = 10,
      sortBy = 'name',
      sortDirection = 'ASC',
      page = 1,
    }: {
      limit?: number;
      sortBy?: string;
      sortDirection?: string;
      page?: number;
    } = req?.query;

    //Validate the query params
    if (!validSortByColumns?.includes(sortBy)) {
      throw new Error(`Invalid sort column ${JSON.stringify(sortBy)}`);
    }
    if (!validOrderDirections?.includes(sortDirection?.toUpperCase())) {
      throw new Error('Invalid order direction');
    }

    //Generate cache key and Check for cache logic
    const cacheKey = JSON.stringify(req?.query);
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      res.status(200).json(cachedValue);
      return;
    }

    //Filters logic
    const filtersData = extractFilters(req?.query);
    if (filtersData?.isError) {
      res.status(400).json({ ...filtersData, success: false });
      return;
    }

    //Declare baseQuery,queryparams and extend according to needs
    let baseQuery = `SELECT d.*,
    CASE 
        WHEN d.diet THEN 'vegetarian' 
        ELSE 'non vegetarian' 
       END AS diet_label,
    COUNT(*) OVER() AS total_count,
    ARRAY_AGG(i.name) AS ingredient_names
    FROM dishes d
    LEFT JOIN dishes_ingredients di ON d.id = di.dish_id
    LEFT JOIN ingredients i ON di.ingredient_id = i.id
    `;
    const queryParams = [];
    // Initialize filter conditions
    const filterConditions = [];

    // Narrow the type here, so TypeScript knows you're working with the success case

    if (filtersData?.cookTimeLTE) {
      filterConditions.push(`d.cook_time <= $${queryParams.length + 1}`);
      queryParams.push(filtersData.cookTimeLTE);
    }

    if (filtersData?.cookTimeGTE) {
      filterConditions.push(`d.cook_time >= $${queryParams.length + 1}`);
      queryParams.push(filtersData.cookTimeGTE);
    }

    if (filtersData?.prepTimeLTE) {
      filterConditions.push(`d.prep_time <= $${queryParams.length + 1}`);
      queryParams.push(filtersData.prepTimeLTE);
    }

    if (filtersData?.prepTimeGTE) {
      filterConditions.push(`d.prep_time >= $${queryParams.length + 1}`);
      queryParams.push(filtersData.prepTimeGTE);
    }

    if (filtersData?.course) {
      filterConditions.push(`d.course = $${queryParams.length + 1}`);
      queryParams.push(filtersData.course);
    }

    if (filtersData?.flavor) {
      filterConditions.push(`d.flavor = $${queryParams.length + 1}`);
      queryParams.push(filtersData.flavor);
    }

    if (filtersData?.region) {
      filterConditions.push(`d.region = $${queryParams.length + 1}`);
      queryParams.push(filtersData.region);
    }

    if (filtersData?.state) {
      filterConditions.push(`d.state = $${queryParams.length + 1}`);
      queryParams.push(filtersData.state);
    }
    if (filtersData?.diet === 0 || filtersData?.diet === 1) {
      filterConditions.push(`d.diet = $${queryParams.length + 1}`);
      queryParams.push(filtersData.diet === 1 ? true : false);
    }

    // If we have any filter conditions, append them to the base query
    if (filterConditions.length > 0) {
      baseQuery += ' WHERE ' + filterConditions.join(' AND ');
    }
    baseQuery += ` GROUP BY d.id ORDER BY ${sortBy} ${sortDirection}  LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // Calculate offset then push limit and offset
    const offset = (page - 1) * limit;
    queryParams.push(limit);
    queryParams.push(offset);
    const response = await executeQuery(baseQuery, queryParams);
    cache.set(cacheKey, response);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    const message = error?.message || 'Error occured while fetching dishes';
    res.status(400).json({ success: false, message, error });
    return;
  }
};

export const dishSuggestion = async (req: Request, res: Response) => {
  try {
    const {
      ingredientsFilter = [],
      sortBy = 'name',
      sortDirection = 'ASC',
    } = req?.query as any;

    if (!validSortByColumns?.includes(sortBy)) {
      throw new Error(`Invalid sort column ${JSON.stringify(sortBy)}`);
    }
    if (!validOrderDirections?.includes(sortDirection?.toUpperCase())) {
      throw new Error('Invalid order direction');
    }

    const filteredValues = ingredientsFilter?.filter(Boolean);

    //Generate cache key and Check for cache logic
    const cacheKey = JSON.stringify({ sortBy, sortDirection, filteredValues });
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      res.status(200).json(cachedValue);
      return;
    }

    const query = `
      WITH selected_ingredients AS (
          SELECT unnest($1::text[]) AS ingredient_name
      )
      SELECT d.*,
      CASE 
        WHEN d.diet THEN 'vegetarian' 
        ELSE 'non vegetarian' 
       END AS diet_label,
      COUNT(*) OVER() AS total_count,
      ARRAY_AGG(i.name) AS ingredient_names
      FROM dishes d
      JOIN dishes_ingredients di ON d.id = di.dish_id
      JOIN ingredients i ON di.ingredient_id = i.id
      WHERE i.name IN (SELECT ingredient_name FROM selected_ingredients)
      GROUP BY d.id
      HAVING COUNT(DISTINCT i.id) = (
          SELECT COUNT(DISTINCT di2.ingredient_id)
          FROM dishes_ingredients di2
          WHERE di2.dish_id = d.id
      )
      ORDER BY ${sortBy} ${sortDirection};
    `;

    const response = await executeQuery(query, [filteredValues]);
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

export const autoSuggestion = async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req?.query;
    if (!searchTerm) {
      res.status(400).json({
        success: false,
        message: 'Not Found - searchTerm',
      });
      return;
    }
    const modifiedSearchTerm = trimAndLower(searchTerm as string);
    if (modifiedSearchTerm?.length < 2) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'Please enter more than 3 characters!!',
      });
      return;
    }
    const cacheKey = JSON.stringify(modifiedSearchTerm);
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      res.status(200).json(cachedValue);
      return;
    }
    const query = `
      SELECT d.id, d.name
      FROM dishes d
      LEFT JOIN dishes_ingredients di ON d.id = di.dish_id
      LEFT JOIN ingredients i ON di.ingredient_id = i.id
      WHERE d.name LIKE $1
      OR i.name LIKE $1
      OR d.flavor::text LIKE $1
      OR d.state LIKE $1
      OR d.region::text LIKE $1
      OR d.course::text LIKE $1
      GROUP BY d.id
      ORDER BY name ASC;
    `;
    const response = await executeQuery(query, [`%${modifiedSearchTerm}%`]);
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
