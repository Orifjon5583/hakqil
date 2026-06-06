CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin');
CREATE TYPE device_status AS ENUM ('online', 'offline');
CREATE TYPE command_type AS ENUM ('screenshot', 'camera', 'lock', 'unlock', 'message', 'restart', 'shutdown');
CREATE TYPE command_status AS ENUM ('pending', 'sent', 'completed', 'failed', 'cancelled');
CREATE TYPE snapshot_type AS ENUM ('screenshot', 'camera');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(80) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'admin',
  full_name varchar(160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);

CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id varchar(160) NOT NULL UNIQUE,
  device_code varchar(20) NOT NULL UNIQUE,
  brand varchar(80) NOT NULL,
  computer_name varchar(160),
  windows_username varchar(160),
  ip_address inet,
  os_version varchar(160),
  agent_version varchar(40),
  last_activity_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_devices_brand ON devices(brand);
CREATE INDEX idx_devices_last_seen_at ON devices(last_seen_at DESC);
CREATE INDEX idx_devices_device_code ON devices(device_code);

CREATE TABLE device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  windows_username varchar(160),
  ip_address inet,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX idx_device_sessions_last_seen_at ON device_sessions(last_seen_at DESC);

CREATE TABLE commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES users(id) ON DELETE SET NULL,
  type command_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status command_status NOT NULL DEFAULT 'pending',
  result jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX idx_commands_device_status ON commands(device_id, status);
CREATE INDEX idx_commands_type ON commands(type);
CREATE INDEX idx_commands_created_at ON commands(created_at DESC);

CREATE TABLE snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  command_id uuid REFERENCES commands(id) ON DELETE SET NULL,
  taken_by uuid REFERENCES users(id) ON DELETE SET NULL,
  type snapshot_type NOT NULL,
  file_path text NOT NULL,
  mime_type varchar(80) NOT NULL DEFAULT 'image/png',
  file_size bigint,
  taken_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_device_id ON snapshots(device_id);
CREATE INDEX idx_snapshots_type ON snapshots(type);
CREATE INDEX idx_snapshots_taken_at ON snapshots(taken_at DESC);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  command_id uuid REFERENCES commands(id) ON DELETE SET NULL,
  action varchar(120) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_device_id ON audit_logs(device_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
