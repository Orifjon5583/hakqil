import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/auth.js";
import { getAppSettings, updateAppSettings } from "../services/settings.js";
import { writeAudit } from "../services/audit.js";

export const settingsRouter = Router();

const settingsSchema = z.object({
  emergencyUnlockPassword: z.string().trim().min(8).max(120),
  dailyShutdownEnabled: z.boolean(),
  dailyShutdownTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  agentUpdateVersion: z.string().trim().min(1).max(40),
  agentUpdateUrl: z.string().trim().url().or(z.literal(""))
});

settingsRouter.get("/", requireAdmin, async (_req, res) => {
  res.json({ settings: await getAppSettings() });
});

settingsRouter.put("/", requireAdmin, async (req, res) => {
  const settings = settingsSchema.parse(req.body);
  await updateAppSettings(settings);
  await writeAudit({
    userId: req.user?.sub,
    action: "Settings yangilandi",
    ipAddress: req.ip
  });
  res.json({ settings });
});
