import pg, { type QueryResultRow } from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}
