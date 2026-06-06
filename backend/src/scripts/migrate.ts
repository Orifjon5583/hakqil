import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool, query } from "../db/pool.js";

const migrationsDir = path.resolve("db", "migrations");

await query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);

const applied = await query<{ filename: string }>("SELECT filename FROM schema_migrations");
const appliedFiles = new Set(applied.rows.map((row) => row.filename));
const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b));

for (const file of files) {
  if (appliedFiles.has(file)) continue;

  const sql = await readFile(path.join(migrationsDir, file), "utf8");
  await query("BEGIN");
  try {
    await query(sql);
    await query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
    await query("COMMIT");
    console.log(`Applied ${file}`);
  } catch (error) {
    await query("ROLLBACK");
    throw error;
  }
}

await pool.end();
console.log("Migrations ready");
