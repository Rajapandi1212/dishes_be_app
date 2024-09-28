import { Pool } from 'pg';
import 'dotenv/config';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
export const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
});
