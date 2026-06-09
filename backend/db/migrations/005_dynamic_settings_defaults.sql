DELETE FROM app_settings
WHERE key = 'emergency_unlock_password'
  AND value = to_jsonb('CHANGE_EMERGENCY_UNLOCK_PASSWORD'::text);
