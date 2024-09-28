import { pool } from './db';

export const executeQuery = async (query: any, values?: any) => {
  try {
    const res = await pool.query(query, values ?? undefined);
    return {
      success: true,
      data: res?.rows,
      count: res?.rowCount,
      total: (res?.rows?.[0] as any)?.total_count,
    };
  } catch (error) {
    console.error('Error while executing query :', error);
    throw error;
  }
};
