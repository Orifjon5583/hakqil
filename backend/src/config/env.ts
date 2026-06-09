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
  ONLINE_THRESHOLD_SECONDS: z.coerce.number().default(45),
  DEFAULT_EMERGENCY_UNLOCK_PASSWORD: z.string().min(8).default("CHANGE_EMERGENCY_UNLOCK_PASSWORD"),
  DEFAULT_DAILY_SHUTDOWN_ENABLED: z.coerce.boolean().default(true),
  DEFAULT_DAILY_SHUTDOWN_TIME: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("23:00"),
  DEFAULT_AGENT_UPDATE_VERSION: z.string().min(1).default("1.0.0"),
  DEFAULT_AGENT_UPDATE_URL: z.string().url().or(z.literal("")).default("")
});

export const env = envSchema.parse(process.env);
