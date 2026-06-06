# Security Architecture

Robbit Monitor is intended for academy-owned computers with visible monitoring policy and administrator accountability.

## Transport

- Production must run behind HTTPS.
- Nginx and Certbot terminate TLS.
- TLS 1.3 should be enabled on the VPS where supported.
- Agents must use `https://your-domain.uz/api`.

## Authentication

- Admin users authenticate with username and password.
- Passwords are hashed with bcrypt.
- Admin API uses JWT bearer tokens.
- Agent API uses a separate JWT secret and agent tokens.
- Server secrets live only in `.env`.

## Authorization

- Admin endpoints use `requireAdmin`.
- Agent endpoints use `requireAgent`.
- MVP supports only the `admin` role.
- Future Teacher and Parent modules should add role and permission tables before exposing new routes.

## Data Protection

- PostgreSQL queries use parameterized SQL through `pg`.
- Snapshot metadata is stored in `snapshots`.
- Snapshot binary storage should be private in production and served only through authenticated API routes.
- Audit logs are append-only by application design.

## Abuse Protection

- Express rate limiting is enabled globally.
- Helmet is enabled for common HTTP hardening.
- CORS is restricted by `CORS_ORIGIN`.
- Login brute-force lockout, refresh-token rotation, 2FA, and device-token revoke are planned production hardening tasks.

## Backup

- PostgreSQL backups should run daily through cron or systemd timer.
- Backups must be copied outside the VPS.
- Restore should be tested before real classroom rollout.
