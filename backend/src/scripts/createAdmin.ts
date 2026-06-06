import bcrypt from "bcryptjs";
import { pool, query } from "../db/pool.js";

const username = process.argv[2] ?? "admin";
const password = process.argv[3];

if (!password) {
  console.error("Usage: npm run create-admin -- admin StrongPassword123");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await query(
  `INSERT INTO users (username, password_hash, role)
   VALUES ($1, $2, 'admin')
   ON CONFLICT (username)
   DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()`,
  [username, passwordHash]
);

await pool.end();
console.log(`Admin ready: ${username}`);

