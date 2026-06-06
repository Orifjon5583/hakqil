import { query } from "../db/pool.js";
import { writeAudit } from "./audit.js";

export type CommandType =
  | "screenshot"
  | "camera"
  | "lock"
  | "unlock"
  | "message"
  | "restart"
  | "shutdown";

const actionLabel: Record<CommandType, string> = {
  screenshot: "Screenshot olindi",
  camera: "Camera snapshot olindi",
  lock: "Lock qilindi",
  unlock: "Unlock qilindi",
  message: "Message yuborildi",
  restart: "Restart yuborildi",
  shutdown: "Shutdown yuborildi"
};

export async function createCommand(input: {
  deviceId: string;
  requestedBy: string;
  type: CommandType;
  payload?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const result = await query<{ id: string }>(
    `INSERT INTO commands (device_id, requested_by, type, payload)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.deviceId, input.requestedBy, input.type, JSON.stringify(input.payload ?? {})]
  );

  const commandId = result.rows[0].id;
  await writeAudit({
    userId: input.requestedBy,
    deviceId: input.deviceId,
    commandId,
    action: actionLabel[input.type],
    metadata: input.payload,
    ipAddress: input.ipAddress
  });

  return { id: commandId };
}

