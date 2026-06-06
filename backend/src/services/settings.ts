import { query } from "../db/pool.js";

export type AppSettings = {
  emergencyUnlockPassword: string;
  dailyShutdownEnabled: boolean;
  dailyShutdownTime: string;
  agentUpdateVersion: string;
  agentUpdateUrl: string;
};

const defaults: AppSettings = {
  emergencyUnlockPassword: "CHANGE_EMERGENCY_UNLOCK_PASSWORD",
  dailyShutdownEnabled: true,
  dailyShutdownTime: "23:00",
  agentUpdateVersion: "1.0.0",
  agentUpdateUrl: ""
};

const keys: Record<keyof AppSettings, string> = {
  emergencyUnlockPassword: "emergency_unlock_password",
  dailyShutdownEnabled: "daily_shutdown_enabled",
  dailyShutdownTime: "daily_shutdown_time",
  agentUpdateVersion: "agent_update_version",
  agentUpdateUrl: "agent_update_url"
};

export async function getAppSettings(): Promise<AppSettings> {
  const result = await query<{ key: string; value: unknown }>(
    "SELECT key, value FROM app_settings WHERE key = ANY($1)",
    [Object.values(keys)]
  );

  const values = new Map(result.rows.map((row) => [row.key, row.value]));
  return {
    emergencyUnlockPassword: String(values.get(keys.emergencyUnlockPassword) ?? defaults.emergencyUnlockPassword),
    dailyShutdownEnabled: Boolean(values.get(keys.dailyShutdownEnabled) ?? defaults.dailyShutdownEnabled),
    dailyShutdownTime: String(values.get(keys.dailyShutdownTime) ?? defaults.dailyShutdownTime),
    agentUpdateVersion: String(values.get(keys.agentUpdateVersion) ?? defaults.agentUpdateVersion),
    agentUpdateUrl: String(values.get(keys.agentUpdateUrl) ?? defaults.agentUpdateUrl)
  };
}

export async function updateAppSettings(settings: AppSettings) {
  for (const [name, key] of Object.entries(keys) as Array<[keyof AppSettings, string]>) {
    await query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, JSON.stringify(settings[name])]
    );
  }
}
