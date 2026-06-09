import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAgent } from "../middleware/auth.js";
import { getAppSettings } from "../services/settings.js";

export const agentRouter = Router();
agentRouter.use(requireAgent);

function asyncRoute(handler: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const heartbeatSchema = z.object({
  deviceId: z.string().min(3).max(160),
  deviceCode: z.string().min(4).max(20),
  brand: z.string().min(1).max(80).optional(),
  computerName: z.string().max(160).optional(),
  username: z.string().max(160).optional(),
  lastActivityAt: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().datetime({ offset: true }).optional()
  ),
  ipAddress: z.string().ip().optional(),
  osVersion: z.string().max(160).optional(),
  agentVersion: z.string().max(40).optional(),
  activeWindowTitle: z.string().max(240).optional(),
  activeProcessName: z.string().max(160).optional()
});

function brandFromCode(code: string) {
  const prefix = code.split("-")[0]?.trim();
  if (!prefix) return "Unknown";
  if (prefix.toUpperCase() === "LEN") return "Lenovo";
  return prefix.toUpperCase();
}

agentRouter.post("/heartbeat", asyncRoute(async (req: any, res: any) => {
  const body = heartbeatSchema.parse(req.body);
  if (req.agent?.deviceCode && req.agent.deviceCode !== body.deviceCode) {
    return res.status(403).json({ error: "Agent token does not match device code" });
  }

  const brand = body.brand?.trim() || brandFromCode(body.deviceCode);

  const result = await query<{ id: string }>(
    `INSERT INTO devices
      (device_id, device_code, brand, computer_name, windows_username, ip_address, os_version, agent_version, last_activity_at, active_window_title, active_process_name, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     ON CONFLICT (device_id)
     DO UPDATE SET
      device_code = EXCLUDED.device_code,
      brand = EXCLUDED.brand,
      computer_name = EXCLUDED.computer_name,
      windows_username = EXCLUDED.windows_username,
      ip_address = EXCLUDED.ip_address,
      os_version = EXCLUDED.os_version,
      agent_version = EXCLUDED.agent_version,
      last_activity_at = EXCLUDED.last_activity_at,
      active_window_title = EXCLUDED.active_window_title,
      active_process_name = EXCLUDED.active_process_name,
      last_seen_at = now(),
      updated_at = now()
     RETURNING id`,
    [
      body.deviceId,
      body.deviceCode,
      brand,
      body.computerName ?? null,
      body.username ?? null,
      body.ipAddress ?? null,
      body.osVersion ?? null,
      body.agentVersion ?? null,
      body.lastActivityAt ?? null,
      body.activeWindowTitle ?? null,
      body.activeProcessName ?? null
    ]
  );

  res.json({ ok: true, devicePk: result.rows[0].id });
}));

agentRouter.get("/commands", asyncRoute(async (req: any, res: any) => {
  const deviceId = z.string().min(3).parse(req.query.deviceId);
  const device = await query<{ id: string }>(
    `SELECT id FROM devices
     WHERE device_id = $1
       AND ($2::text IS NULL OR device_code = $2)`,
    [deviceId, req.agent?.deviceCode ?? null]
  );
  if (!device.rows[0]) return res.json({ commands: [] });

  const commands = await query(
    `UPDATE commands
     SET status = 'sent', sent_at = COALESCE(sent_at, now())
     WHERE id IN (
       SELECT id FROM commands
       WHERE device_id = $1 AND status = 'pending'
       ORDER BY created_at ASC
       LIMIT 10
     )
     RETURNING id, type, payload, created_at`,
    [device.rows[0].id]
  );

  res.json({ commands: commands.rows });
}));

agentRouter.get("/settings", asyncRoute(async (_req: any, res: any) => {
  const settings = await getAppSettings();
  res.json({ settings });
}));

const resultSchema = z.object({
  commandId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
  result: z.record(z.unknown()).optional(),
  errorMessage: z.string().max(1000).optional()
});

agentRouter.post("/result", asyncRoute(async (req: any, res: any) => {
  const body = resultSchema.parse(req.body);
  await query(
    `UPDATE commands c
     SET status = $2, result = $3, error_message = $4, completed_at = now()
     FROM devices d
     WHERE c.id = $1
       AND d.id = c.device_id
       AND ($5::text IS NULL OR d.device_code = $5)`,
    [body.commandId, body.status, JSON.stringify(body.result ?? {}), body.errorMessage ?? null, req.agent?.deviceCode ?? null]
  );
  res.json({ ok: true });
}));
