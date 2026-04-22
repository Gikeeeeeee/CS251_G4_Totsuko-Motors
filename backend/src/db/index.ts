import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Create backend/.env or set the variable before starting the server.');
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };
export const db = drizzle(pool, { schema });
