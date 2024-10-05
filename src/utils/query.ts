import { pool } from './db';

export const executeQuery = async (query: any, values?: any) => {
  try {
    const res = await pool.query(query, values ?? undefined);
    const total = (res?.rows?.[0] as any)?.total_count;
    return {
      success: true,
      data: res?.rows,
      count: res?.rowCount,
      total: total ? parseInt(total) : total,
    };
  } catch (error) {
    console.error('Error while executing query :', error);
    throw error;
  }
};
