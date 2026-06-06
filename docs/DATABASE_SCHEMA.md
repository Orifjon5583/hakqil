# Database Schema

## `users`

Fields:

- `id uuid` primary key
- `username varchar(80)` unique, required
- `password_hash text` required
- `role user_role` required, MVP value: `admin`
- `full_name varchar(160)`
- `created_at timestamptz`
- `updated_at timestamptz`

Relations:

- One user can request many `commands`.
- One user can take many `snapshots`.
- One user can create many `audit_logs`.

Indexes:

- Primary key: `id`
- Unique: `username`
- `idx_users_role(role)`

## `devices`

Fields:

- `id uuid` primary key
- `device_id varchar(160)` unique stable agent id
- `device_code varchar(20)` unique code, example `HP-01`
- `brand device_brand`: `HP`, `Lenovo`, `Acer`
- `computer_name varchar(160)`
- `windows_username varchar(160)`
- `ip_address inet`
- `os_version varchar(160)`
- `agent_version varchar(40)`
- `last_activity_at timestamptz`
- `last_seen_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Relations:

- One device has many `device_sessions`.
- One device has many `commands`.
- One device has many `snapshots`.
- One device has many `audit_logs`.

Indexes:

- Primary key: `id`
- Unique: `device_id`
- Unique: `device_code`
- `idx_devices_brand(brand)`
- `idx_devices_last_seen_at(last_seen_at DESC)`
- `idx_devices_device_code(device_code)`

## `device_sessions`

Fields:

- `id uuid` primary key
- `device_id uuid` foreign key to `devices.id`
- `windows_username varchar(160)`
- `ip_address inet`
- `started_at timestamptz`
- `ended_at timestamptz`
- `last_seen_at timestamptz`

Relations:

- Many sessions belong to one device.

Indexes:

- Primary key: `id`
- Foreign key: `device_id -> devices.id ON DELETE CASCADE`
- `idx_device_sessions_device_id(device_id)`
- `idx_device_sessions_last_seen_at(last_seen_at DESC)`

## `commands`

Fields:

- `id uuid` primary key
- `device_id uuid` foreign key to `devices.id`
- `requested_by uuid` foreign key to `users.id`
- `type command_type`
- `payload jsonb`
- `status command_status`
- `result jsonb`
- `error_message text`
- `created_at timestamptz`
- `sent_at timestamptz`
- `completed_at timestamptz`

Relations:

- Many commands belong to one device.
- Many commands are requested by one user.
- One command can create one or many snapshots depending on future batching.
- One command can be referenced by many audit logs.

Indexes:

- Primary key: `id`
- Foreign key: `device_id -> devices.id ON DELETE CASCADE`
- Foreign key: `requested_by -> users.id ON DELETE SET NULL`
- `idx_commands_device_status(device_id, status)`
- `idx_commands_type(type)`
- `idx_commands_created_at(created_at DESC)`

## `snapshots`

Fields:

- `id uuid` primary key
- `device_id uuid` foreign key to `devices.id`
- `command_id uuid` foreign key to `commands.id`
- `taken_by uuid` foreign key to `users.id`
- `type snapshot_type`: `screenshot`, `camera`
- `file_path text`
- `mime_type varchar(80)`
- `file_size bigint`
- `taken_at timestamptz`
- `created_at timestamptz`

Relations:

- Many snapshots belong to one device.
- Snapshot can belong to one command.
- Snapshot can be tied to one admin user.

Indexes:

- Primary key: `id`
- Foreign key: `device_id -> devices.id ON DELETE CASCADE`
- Foreign key: `command_id -> commands.id ON DELETE SET NULL`
- Foreign key: `taken_by -> users.id ON DELETE SET NULL`
- `idx_snapshots_device_id(device_id)`
- `idx_snapshots_type(type)`
- `idx_snapshots_taken_at(taken_at DESC)`

## `audit_logs`

Fields:

- `id uuid` primary key
- `user_id uuid` foreign key to `users.id`
- `device_id uuid` foreign key to `devices.id`
- `command_id uuid` foreign key to `commands.id`
- `action varchar(120)`
- `metadata jsonb`
- `ip_address inet`
- `created_at timestamptz`

Relations:

- Many audit logs can belong to one user.
- Many audit logs can belong to one device.
- Many audit logs can reference one command.

Indexes:

- Primary key: `id`
- Foreign key: `user_id -> users.id ON DELETE SET NULL`
- Foreign key: `device_id -> devices.id ON DELETE SET NULL`
- Foreign key: `command_id -> commands.id ON DELETE SET NULL`
- `idx_audit_logs_user_id(user_id)`
- `idx_audit_logs_device_id(device_id)`
- `idx_audit_logs_action(action)`
- `idx_audit_logs_created_at(created_at DESC)`

