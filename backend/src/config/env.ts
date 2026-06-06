import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(24),
  AGENT_JWT_SECRET: z.string().min(24),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  ONLINE_THRESHOLD_SECONDS: z.coerce.number().default(45)
});

export const env = envSchema.parse(process.env);

