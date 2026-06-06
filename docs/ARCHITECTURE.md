# Robbit Monitor v1 Architecture

## 1. To'liq arxitektura

Robbit Monitor v1 uch qismdan iborat:

1. **Admin Panel**: React web ilova. Admin login qiladi, dashboard, devices, snapshots, audit logs va settings sahifalaridan foydalanadi.
2. **Backend API**: Express server. Auth, device registry, command queue, snapshots metadata, audit logs va agent endpointlarini boshqaradi.
3. **Windows Agent**: Har bir akademiya kompyuterida Windows Service sifatida ishlaydi. Heartbeat yuboradi, command poll qiladi, natijani backendga qaytaradi.

## Device ro'yxati

HP:
`HP-01`, `HP-02`, `HP-03`, `HP-04`, `HP-05`, `HP-06`, `HP-07`

Lenovo:
`LEN-08`, `LEN-09`, `LEN-10`, `LEN-11`, `LEN-12`, `LEN-13`, `LEN-14`, `LEN-15`, `LEN-16`, `LEN-17`

Acer:
`ACER-18`, `ACER-19`, `ACER-20`, `ACER-21`, `ACER-22`, `ACER-23`, `ACER-24`, `ACER-25`

## Data flow

1. Agent Windows bilan birga start oladi.
2. Agent `POST /agent/heartbeat` ga har 15 soniyada yuboradi:
   - `deviceId`
   - `deviceCode`
   - `computerName`
   - `username`
   - `lastActivityAt`
   - `ipAddress`
   - `osVersion`
   - `agentVersion`
3. Backend `devices.last_seen_at` ni yangilaydi.
4. Admin panel `GET /devices` orqali holatlarni oladi.
5. Admin command bosganda backend `commands` jadvaliga `pending` command yozadi.
6. Agent `GET /agent/commands` orqali o'z commandlarini oladi.
7. Agent commandni bajaradi va `POST /agent/result` bilan natija qaytaradi.
8. Screenshot/camera natijasida rasm serverga yuklanadi yoki signed upload flow orqali saqlanadi.

## Online/offline

Qurilma `last_seen_at` oxirgi 45 soniya ichida bo'lsa `online`, aks holda `offline`.

## Lock screen texnik eslatma

Windows Service Session 0 da ishlaydi, foydalanuvchi desktopiga to'g'ridan-to'g'ri UI chiqarish Windows tomonidan cheklangan. Professional yechim:

- `Robbit.Agent.Service`: heartbeat, command polling, privilege-limited orchestration.
- `Robbit.Agent.Desktop`: user session companion app. Lock overlay, message modal, screenshot va camera adapterlarini bajaradi.

Starter kod service skeletini beradi, desktop companion integratsiyasi uchun adapter nuqtalari ajratilgan.

## 2. Database schema

To'liq SQL: [../backend/db/migrations/001_init.sql](../backend/db/migrations/001_init.sql)
Fields, relations, indexes, primary keys va foreign keys: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

Jadvallar:

- `users`
- `devices`
- `device_sessions`
- `commands`
- `snapshots`
- `audit_logs`

## 3. API dizayni

To'liq API: [API.md](API.md)

## 4. React UI tuzilishi

Sahifalar:

- Login
- Dashboard
- Devices
- Device Detail
- Snapshots
- Audit Logs
- Settings

Komponentlar:

- `Layout`
- `StatCard`
- `DeviceTable`
- `StatusBadge`
- `ActionButton`
- `SnapshotGrid`

## 5. Agent logikasi

Agent:

- Windows Service sifatida ishlaydi.
- 15 soniyada heartbeat yuboradi.
- HTTPS API bilan ishlaydi.
- Agent JWT token ishlatadi.
- Command queue poll qiladi.
- Natijani backendga yuboradi.
- Xatoliklarni log qiladi.

## 6. Folder structure

Frontend:

```text
frontend/
  src/
    api/
    components/
    layouts/
    pages/
    types/
```

Backend:

```text
backend/
  src/
    config/
    db/
    middleware/
    routes/
    services/
    types/
  db/migrations/
```

Agent:

```text
agent/
  Robbit.Agent/
    Commands/
    Models/
    Services/
```

## 7. Development roadmap

1. DB migratsiya va admin seed.
2. Backend auth, devices, commands, audit API.
3. React dashboard va devices UI.
4. Agent heartbeat va command polling.
5. Screenshot upload flow.
6. Camera snapshot adapter.
7. Desktop companion lock/message UI.
8. Ubuntu VPS deploy: Nginx HTTPS, PM2/systemd, PostgreSQL backup.
9. Role system: teacher va parent.
10. Monitoring policy, consent notice va support docs.

## Security

- HTTPS majburiy.
- Admin JWT qisqa muddatli access token.
- Passwordlar bcrypt bilan hash qilinadi.
- `helmet`, rate limit, CORS allowlist.
- Input validation: Zod.
- SQL injection himoyasi: parameterized queries.
- XSS: React escaping, CSP.
- CSRF: cookie auth ishlatilsa CSRF token; MVP bearer token bilan boshlanadi.
- Agent tokenlari alohida rotate qilinadi.
