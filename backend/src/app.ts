import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { agentRouter } from "./routes/agent.js";
import { auditLogsRouter } from "./routes/auditLogs.js";
import { authRouter } from "./routes/auth.js";
import { devicesRouter } from "./routes/devices.js";
import { settingsRouter } from "./routes/settings.js";
import { snapshotsRouter } from "./routes/snapshots.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true, name: "Robbit Monitor v1" }));

app.use("/api/auth", authRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/snapshots", snapshotsRouter);
app.use("/api/audit-logs", auditLogsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/agent", agentRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});
