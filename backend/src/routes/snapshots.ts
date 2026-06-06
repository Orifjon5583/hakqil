import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
import { writeAudit } from "../services/audit.js";

export const snapshotsRouter = Router();
snapshotsRouter.use(requireAdmin);

snapshotsRouter.get("/", async (req, res) => {
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const params: unknown[] = [];
  const where: string[] = [];

  if (deviceId) {
    params.push(deviceId);
    where.push(`s.device_id = $${params.length}`);
  }

  if (type && ["screenshot", "camera"].includes(type)) {
    params.push(type);
    where.push(`s.type = $${params.length}`);
  }

  const result = await query(
    `SELECT s.*, d.device_code, d.computer_name
     FROM snapshots s
     JOIN devices d ON d.id = s.device_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY s.taken_at DESC
     LIMIT 200`,
    params
  );
  res.json({ snapshots: result.rows });
});

snapshotsRouter.delete("/:id", async (req, res) => {
  const result = await query<{ id: string; device_id: string }>(
    "DELETE FROM snapshots WHERE id = $1 RETURNING id, device_id",
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Snapshot not found" });

  await writeAudit({
    userId: req.user?.sub,
    deviceId: result.rows[0].device_id,
    action: "Snapshot o'chirildi",
    ipAddress: req.ip
  });

  res.status(204).send();
});
