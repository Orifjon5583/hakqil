# Robbit Monitor Server Deploy

Target: Ubuntu VPS, Nginx, PostgreSQL, Node.js 20+.

## 1. Server packages

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib git curl
```

Install Node.js 20+ on the server before running npm commands.

## 2. Database

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE robbit_monitor;
CREATE USER robbit_user WITH PASSWORD 'CHANGE_DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE robbit_monitor TO robbit_user;
\c robbit_monitor
GRANT ALL ON SCHEMA public TO robbit_user;
\q
```

## 3. Upload project

Put the project on the server:

```bash
sudo mkdir -p /var/www/robbit-monitor
sudo chown -R $USER:$USER /var/www/robbit-monitor
```

Copy these folders/files to `/var/www/robbit-monitor`:

```text
backend/
frontend/
deploy/
package.json
```

## 4. Backend env

```bash
cd /var/www/robbit-monitor/backend
cp .env.example .env
nano .env
```

Set:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://robbit_user:CHANGE_DB_PASSWORD@localhost:5432/robbit_monitor
JWT_SECRET=PUT_LONG_RANDOM_SECRET_HERE
AGENT_JWT_SECRET=PUT_OTHER_LONG_RANDOM_SECRET_HERE
CORS_ORIGIN=https://your-domain.uz
ONLINE_THRESHOLD_SECONDS=45
DEFAULT_EMERGENCY_UNLOCK_PASSWORD=CHANGE_EMERGENCY_UNLOCK_PASSWORD
DEFAULT_DAILY_SHUTDOWN_ENABLED=true
DEFAULT_DAILY_SHUTDOWN_TIME=23:00
DEFAULT_AGENT_UPDATE_VERSION=1.0.0
DEFAULT_AGENT_UPDATE_URL=
```

## 5. Build and migrate

```bash
cd /var/www/robbit-monitor
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix backend run db:migrate
npm --prefix backend run create-admin -- admin StrongPassword123
```

## 6. Frontend files

```bash
sudo mkdir -p /var/www/robbit-monitor/frontend-static
sudo cp -r /var/www/robbit-monitor/frontend/dist/* /var/www/robbit-monitor/frontend-static/
```

In `deploy/nginx-robbit-monitor.conf`, set:

```nginx
server_name your-domain.uz;
root /var/www/robbit-monitor/frontend-static;
```

Then:

```bash
sudo cp deploy/nginx-robbit-monitor.conf /etc/nginx/sites-available/robbit-monitor
sudo ln -s /etc/nginx/sites-available/robbit-monitor /etc/nginx/sites-enabled/robbit-monitor
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Backend service

```bash
sudo cp deploy/robbit-monitor-api.service /etc/systemd/system/robbit-monitor-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now robbit-monitor-api
sudo systemctl status robbit-monitor-api
```

## 8. HTTPS

After the domain points to the server:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.uz
```

## 9. Agent token

On the server:

```bash
cd /var/www/robbit-monitor
npm --prefix backend run create-agent-token -- academy
```

Use the printed token in each Windows agent `appsettings.json`:

```json
{
  "Robbit": {
    "ApiBaseUrl": "https://your-domain.uz/api",
    "AgentToken": "PASTE_AGENT_TOKEN",
    "DeviceCode": "HP-01",
    "Brand": "HP",
    "AgentVersion": "1.0.0",
    "HeartbeatSeconds": 15
  }
}
```

## 10. Test computers

1. Install and start the agent on one test computer.
2. Open `https://your-domain.uz`.
3. Login with the admin user.
4. Check Dashboard and Devices.
5. The device should become online within 15-45 seconds.
