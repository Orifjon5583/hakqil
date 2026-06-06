# Robbit Monitor v1 API

Base URL: `/api`

## Auth

### POST `/auth/login`

Body:

```json
{ "username": "admin", "password": "secret" }
```

Response:

```json
{ "token": "jwt", "user": { "id": "...", "username": "admin", "role": "admin" } }
```

### POST `/auth/logout`

Client tokenni o'chiradi. Server tarafdan refresh-token blacklist keyingi versiyada qo'shiladi.

## Devices

### GET `/devices`

Query:

- `brand=<device brand>`
- `status=online|offline`

### GET `/devices/:id`

Bitta qurilma detail.

### POST `/devices/:id/screenshot`

Command yaratadi: `screenshot`.

### POST `/devices/:id/camera`

Command yaratadi: `camera`.

### POST `/devices/:id/lock`

Command yaratadi: `lock`.

### POST `/devices/:id/unlock`

Command yaratadi: `unlock`.

### POST `/devices/:id/message`

Body:

```json
{ "message": "Darsga e'tibor bering" }
```

### POST `/devices/:id/restart`

Command yaratadi: `restart`.

### POST `/devices/:id/shutdown`

Command yaratadi: `shutdown`.

## Snapshots

### GET `/snapshots`

Query:

- `deviceId`
- `type=screenshot|camera`

### DELETE `/snapshots/:id`

Snapshot metadata va faylni o'chiradi.

## Audit Logs

### GET `/audit-logs`

Query:

- `deviceId`
- `userId`
- `action`

## Agent

Agent endpointlari agent JWT bilan ishlaydi.

### POST `/agent/heartbeat`

Body:

```json
{
  "deviceId": "machine-guid",
  "deviceCode": "HP-01",
  "brand": "HP",
  "computerName": "HP-01-PC",
  "username": "student",
  "lastActivityAt": "2026-06-06T10:00:00.000Z",
  "ipAddress": "192.168.1.10",
  "osVersion": "Windows 11 Pro",
  "agentVersion": "1.0.0"
}
```

### GET `/agent/commands?deviceId=machine-guid`

Pending commandlar ro'yxatini qaytaradi.

### POST `/agent/result`

Body:

```json
{
  "commandId": "uuid",
  "status": "completed",
  "result": { "message": "ok", "snapshotId": "uuid" }
}
```
