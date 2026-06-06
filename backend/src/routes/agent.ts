import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAgent } from "../middleware/auth.js";

export const agentRouter = Router();
agentRouter.use(requireAgent);

const heartbeatSchema = z.object({
  deviceId: z.string().min(3).max(160),
  deviceCode: z.string().min(4).max(20),
  brand: z.string().min(1).max(80).optional(),
  computerName: z.string().max(160).optional(),
  username: z.string().max(160).optional(),
  lastActivityAt: z.string().datetime().optional(),
  ipAddress: z.string().ip().optional(),
  osVersion: z.string().max(160).optional(),
  agentVersion: z.string().max(40).optional()
});

function brandFromCode(code: string) {
  const prefix = code.split("-")[0]?.trim();
  if (!prefix) return "Unknown";
  if (prefix.toUpperCase() === "LEN") return "Lenovo";
  return prefix.toUpperCase();
}

agentRouter.post("/heartbeat", async (req, res) => {
  const body = heartbeatSchema.parse(req.body);
  const brand = body.brand?.trim() || brandFromCode(body.deviceCode);

  const result = await query<{ id: string }>(
    `INSERT INTO devices
      (device_id, device_code, brand, computer_name, windows_username, ip_address, os_version, agent_version, last_activity_at, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
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
      body.lastActivityAt ?? null
    ]
  );

  res.json({ ok: true, devicePk: result.rows[0].id });
});

agentRouter.get("/commands", async (req, res) => {
  const deviceId = z.string().min(3).parse(req.query.deviceId);
  const device = await query<{ id: string }>("SELECT id FROM devices WHERE device_id = $1", [deviceId]);
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
});

const resultSchema = z.object({
  commandId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
  result: z.record(z.unknown()).optional(),
  errorMessage: z.string().max(1000).optional()
});

agentRouter.post("/result", async (req, res) => {
  const body = resultSchema.parse(req.body);
  await query(
    `UPDATE commands
     SET status = $2, result = $3, error_message = $4, completed_at = now()
     WHERE id = $1`,
    [body.commandId, body.status, JSON.stringify(body.result ?? {}), body.errorMessage ?? null]
  );
  res.json({ ok: true });
});
