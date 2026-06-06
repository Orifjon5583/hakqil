import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { signAdminToken } from "../services/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(2).max(80),
  password: z.string().min(6).max(200)
});

authRouter.post("/login", async (req, res) => {
  const body = loginSchema.parse(req.body);
  const result = await query<{ id: string; username: string; password_hash: string; role: "admin" }>(
    "SELECT id, username, password_hash, role FROM users WHERE username = $1",
    [body.username]
  );

  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(body.password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAdminToken({ sub: user.id, username: user.username, role: user.role });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

authRouter.post("/logout", (_req, res) => {
  res.status(204).send();
});

