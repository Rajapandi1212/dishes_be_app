import { pool } from './db';

export const executeQuery = async (query: any, values?: any) => {
  try {
    const res = await pool.query(query, values ?? undefined);
    return {
      success: true,
      data: res?.rows,
      count: res?.rowCount,
    };
  } catch (error) {
    console.log('Error while executing query :', error);
    return {
      success: false,
      error,
    };
  }
};
