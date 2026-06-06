import { query } from "../db/pool.js";

export async function writeAudit(input: {
  userId?: string;
  deviceId?: string;
  commandId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await query(
    `INSERT INTO audit_logs (user_id, device_id, command_id, action, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.userId ?? null,
      input.deviceId ?? null,
      input.commandId ?? null,
      input.action,
      JSON.stringify(input.metadata ?? {}),
      input.ipAddress ?? null
    ]
  );
}

