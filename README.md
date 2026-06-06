# Robbit Monitor v1

Akademiya kompyuterlarini bitta web panel orqali qonuniy, shaffof va auditli tarzda kuzatish va boshqarish tizimi.

## Stack

- Frontend: React, TypeScript, TailwindCSS, Vite
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Desktop Agent: C# .NET Worker Service / Windows Service
- Server: Ubuntu VPS, HTTPS reverse proxy

## Muhim tamoyillar

- Agent akademiyaga tegishli kompyuterlarda ishlaydi.
- O'quvchilar monitoring mavjudligini biladi.
- Har bir admin amali `audit_logs` jadvaliga yoziladi.
- Screenshot/camera/lock/message kabi amallar yashirin emas, siyosat va ruxsatlar bilan ishlatiladi.
- MVP faqat `admin` rolini qo'llab-quvvatlaydi.

## Papkalar

- `backend` - Express API va PostgreSQL migratsiyalari
- `frontend` - React admin panel
- `agent` - C# Windows Service starter
- `docs` - arxitektura, API, DB schema, roadmap

## Tez start

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Agent:

```powershell
cd agent/Robbit.Agent
dotnet build
```

To'liq texnik tavsif: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Qo'shimcha hujjatlar:

- [Deploy rejasi](docs/DEPLOYMENT.md)
- [Security architecture](docs/SECURITY.md)
- [Installer tuzilishi](docs/INSTALLER.md)
- [Production checklist](docs/PRODUCTION_CHECKLIST.md)
