import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
import { createCommand, type CommandType } from "../services/commands.js";
import { env } from "../config/env.js";
import { signAgentToken } from "../services/auth.js";

export const devicesRouter = Router();
devicesRouter.use(requireAdmin);

const commandPayload = z.object({
  message: z.string().min(1).max(500).optional()
});

const agentTokenPayload = z.object({
  deviceCode: z.string().trim().min(4).max(20).regex(/^[A-Za-z0-9-]+$/),
  brand: z.string().trim().min(1).max(80),
  apiBaseUrl: z.string().trim().url()
});

function statusSql() {
  return `CASE
    WHEN last_seen_at > now() - ($1::int * interval '1 second') THEN 'online'
    ELSE 'offline'
  END`;
}

devicesRouter.get("/", async (req, res) => {
  const brand = typeof req.query.brand === "string" ? req.query.brand : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const params: unknown[] = [env.ONLINE_THRESHOLD_SECONDS];
  const where: string[] = [];

  if (brand) {
    params.push(brand);
    where.push(`brand ILIKE $${params.length}`);
  }

  if (status && ["online", "offline"].includes(status)) {
    params.push(status);
    where.push(`${statusSql()} = $${params.length}`);
  }

  const result = await query(
    `SELECT *, ${statusSql()} AS status
     FROM devices
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY device_code ASC`,
    params
  );

  res.json({ devices: result.rows });
});

devicesRouter.post("/agent-token", async (req, res) => {
  const body = agentTokenPayload.parse(req.body ?? {});
  const deviceCode = body.deviceCode.toUpperCase();
  const brand = body.brand.trim();
  const apiBaseUrl = body.apiBaseUrl.replace(/\/+$/, "");
  const token = signAgentToken(deviceCode);
  const installCommand = [
    ".\\install-agent.ps1",
    `-ApiBaseUrl "${apiBaseUrl}"`,
    `-AgentToken "${token}"`,
    `-DeviceCode "${deviceCode}"`,
    `-Brand "${brand}"`
  ].join(" ");

  await query(
    `INSERT INTO agent_tokens (device_code, brand, api_base_url, token, created_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [deviceCode, brand, apiBaseUrl, token, req.user?.sub ?? null]
  );

  res.json({
    token,
    deviceCode,
    brand,
    apiBaseUrl,
    expiresInDays: 365,
    installCommand
  });
});

devicesRouter.get("/:id", async (req, res) => {
  const result = await query(
    `SELECT *, ${statusSql()} AS status FROM devices WHERE id = $2`,
    [env.ONLINE_THRESHOLD_SECONDS, req.params.id]
  );
  const device = result.rows[0];
  if (!device) return res.status(404).json({ error: "Device not found" });

  const tokens = await query(
    `SELECT id, device_code, brand, api_base_url, token, created_at
     FROM agent_tokens
     WHERE device_code = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [device.device_code]
  );

  res.json({ device, agentTokens: tokens.rows });
});

function commandRoute(type: CommandType) {
  return async (req: any, res: any) => {
    const body = commandPayload.parse(req.body ?? {});
    if (type === "message" && !body.message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const command = await createCommand({
      deviceId: req.params.id,
      requestedBy: req.user.sub,
      type,
      payload: body,
      ipAddress: req.ip
    });

    return res.status(202).json({ command });
  };
}

devicesRouter.post("/:id/screenshot", commandRoute("screenshot"));
devicesRouter.post("/:id/camera", commandRoute("camera"));
devicesRouter.post("/:id/lock", commandRoute("lock"));
devicesRouter.post("/:id/unlock", commandRoute("unlock"));
devicesRouter.post("/:id/message", commandRoute("message"));
devicesRouter.post("/:id/restart", commandRoute("restart"));
devicesRouter.post("/:id/shutdown", commandRoute("shutdown"));
