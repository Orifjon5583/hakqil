# Production Checklist

## Before Deploy

- Domain points to the VPS.
- VPS firewall allows `80` and `443`.
- PostgreSQL database and user are created.
- `.env` uses long random secrets.
- `CORS_ORIGIN` matches the real domain.

## Deploy

- Run backend build.
- Run frontend build.
- Run database migrations.
- Create the first admin user.
- Configure systemd API service.
- Configure Nginx.
- Enable HTTPS with Certbot.

## After Deploy

- Open `/health` through the domain.
- Login with the admin account.
- Confirm Dashboard loads through HTTPS.
- Set `DEFAULT_EMERGENCY_UNLOCK_PASSWORD` or update it from Settings.
- Generate agent token.
- Install agent on one test computer first.
- Confirm the device becomes online.

## Security

- Rotate default admin password.
- Store `.env` outside public access.
- Restrict SSH access.
- Enable automatic security updates.
- Configure daily PostgreSQL backups.
- Copy backups to separate storage.

## Classroom Rollout

- Assign device codes before installation.
- Install agents one brand/group at a time.
- Verify online status after each group.
- Keep a list of computer name, device code, and location.
- Document monitoring policy for users.
