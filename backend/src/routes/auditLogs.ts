import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";

export const auditLogsRouter = Router();
auditLogsRouter.use(requireAdmin);

auditLogsRouter.get("/", async (req, res) => {
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : undefined;
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  const action = typeof req.query.action === "string" ? req.query.action : undefined;
  const params: unknown[] = [];
  const where: string[] = [];

  if (deviceId) {
    params.push(deviceId);
    where.push(`a.device_id = $${params.length}`);
  }

  if (userId) {
    params.push(userId);
    where.push(`a.user_id = $${params.length}`);
  }

  if (action) {
    params.push(`%${action}%`);
    where.push(`a.action ILIKE $${params.length}`);
  }

  const result = await query(
    `SELECT a.*, u.username, d.device_code
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN devices d ON d.id = a.device_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY a.created_at DESC
     LIMIT 500`,
    params
  );
  res.json({ auditLogs: result.rows });
});
