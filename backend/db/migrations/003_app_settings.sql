CREATE TABLE app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_settings (key, value)
VALUES
  ('emergency_unlock_password', to_jsonb('CHANGE_EMERGENCY_UNLOCK_PASSWORD'::text)),
  ('daily_shutdown_enabled', to_jsonb(true)),
  ('daily_shutdown_time', to_jsonb('23:00'::text)),
  ('agent_update_version', to_jsonb('1.0.0'::text)),
  ('agent_update_url', to_jsonb(''::text))
ON CONFLICT (key) DO NOTHING;
