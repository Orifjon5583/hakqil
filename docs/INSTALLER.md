# Installer Structure

The Windows agent is a .NET Worker Service starter. Production installer packaging should wrap the published agent files and register the Windows Service.

## 25 Notebook Rollout

Device ro'yxati: [../deploy/devices.csv](../deploy/devices.csv)

Kodlar:

- `HP-01` ... `HP-07`
- `LEN-08` ... `LEN-17`
- `ACER-18` ... `ACER-25`

Har bir notebookga o'ziga tegishli `DeviceCode` beriladi. Bir xil code ikki kompyuterda ishlatilmasligi kerak.

## Agent Configuration

Each computer needs:

```json
{
  "Robbit": {
    "ApiBaseUrl": "https://your-domain.uz/api",
    "AgentToken": "PASTE_AGENT_TOKEN",
    "DeviceCode": "HP-01",
    "Brand": "HP",
    "AgentVersion": "1.0.0",
    "HeartbeatSeconds": 15,
    "EmergencyUnlockPassword": "CHANGE_EMERGENCY_UNLOCK_PASSWORD"
  }
}
```

## Publish

On a machine with .NET SDK:

```powershell
cd agent\Robbit.Agent
dotnet publish -c Release -r win-x64 --self-contained true -o ..\..\deploy\publish
cd ..\Robbit.Agent.Desktop
dotnet publish -c Release -r win-x64 --self-contained true -o ..\..\deploy\publish
```

## Generate Agent Tokens

Backend `.env` ichida `AGENT_JWT_SECRET` production qiymati turgan bo'lishi kerak.

One token:

```powershell
cd backend
npm run create-agent-token -- HP-01
```

Batch token output:

```powershell
cd backend
npm run create-agent-tokens -- HP-01 HP-02 HP-03 HP-04 HP-05 HP-06 HP-07 LEN-08 LEN-09 LEN-10 LEN-11 LEN-12 LEN-13 LEN-14 LEN-15 LEN-16 LEN-17 ACER-18 ACER-19 ACER-20 ACER-21 ACER-22 ACER-23 ACER-24 ACER-25
```

Output `DeviceCode,Token` formatida chiqadi. Tokenlarni maxfiy saqlang.

## Install Service On Each Notebook

Run PowerShell as Administrator:

```powershell
cd deploy
.\install-agent.ps1 `
  -ApiBaseUrl "http://SERVER_IP:4000/api" `
  -AgentToken "PASTE_AGENT_TOKEN_FOR_THIS_DEVICE" `
  -DeviceCode "HP-01" `
  -Brand "HP" `
  -EmergencyUnlockPassword 'CHANGE_EMERGENCY_UNLOCK_PASSWORD'
```

`SourcePath` default qiymati `.\publish`, ya'ni `deploy\publish` ichida `Robbit.Agent.exe` bo'lishi kerak.
`Robbit.Agent.Desktop.exe` ham shu papkada bo'lsa, installer uni Windows loginida avtomatik ishga tushadigan qilib qo'yadi.
`appsettings.json` ichidagi server IP va token installer tomonidan faqat `SYSTEM` va `Administrators` o'qiydigan qilib himoyalanadi.

## IP Address And Activity

Domain shart emas. Lokal/VPS IP bilan ishlatish mumkin:

- Frontend: `http://SERVER_IP`
- Backend API: `http://SERVER_IP:4000/api`
- Agent `ApiBaseUrl`: `http://SERVER_IP:4000/api`

Agent heartbeat ichida notebook IP adresini yuboradi. Desktop companion user sessionda faol oynani o'qib, service heartbeat orqali yuborishi uchun `C:\ProgramData\RobbitMonitor\desktop-status.json`ga yozadi.

Admin panelda `Devices` jadvalida ko'rinadi:

- IP Address
- Active Process
- Active Window

## Emergency Unlock

Lock buyrug'i kelganda user sessionda fullscreen oyna chiqadi:

- "Kompyuter vaqtincha bloklandi"
- "Parolni kiriting yoki adminga murojaat qiling."

Sayt yoki internet ishlamay qolsa, lokal favqulodda parol bilan ochiladi:

```text
CHANGE_EMERGENCY_UNLOCK_PASSWORD
```

Bu parolni faqat admin bilishi kerak. O'quvchilarga tarqatmang.
Admin paneldagi `Settings` sahifasidan bu parolni keyinroq o'zgartirish mumkin. Agent har heartbeat siklida serverdan yangi sozlamani olib turadi.

## Daily Shutdown And Update

Admin paneldagi `Settings` sahifasida quyidagilar tahrirlanadi:

- Emergency unlock password
- Daily shutdown enabled
- Daily shutdown time, default `23:00`
- Agent update version
- Agent update ZIP URL

Agent har kuni belgilangan vaqtdan keyin faqat bir marta ishga tushadi:

1. Serverdan settings oladi.
2. `Agent update version` hozirgi agent versiyasidan farq qilsa va `Agent update ZIP URL` bo'lsa, ZIP faylni yuklab oladi.
3. Update faylini `C:\ProgramData\RobbitMonitor\Update` ichiga stage qiladi.
4. Keyingi bootda `RunOnce` orqali update fayllarini install papkaga copy qiladi.
5. Notebookni 60 soniya ichida o'chiradi.

Update ZIP ichida publish qilingan `Robbit.Agent.exe`, `Robbit.Agent.Desktop.exe` va kerakli `.dll` fayllar bo'lishi kerak.

## Uninstall

Run PowerShell as Administrator:

```powershell
cd deploy
.\uninstall-agent.ps1
```

## Recommended Production Installer

- Package files into `C:\Program Files\Robbit Monitor Agent`.
- Write `appsettings.json` during install.
- Register the service as automatic start.
- Add uninstall flow that stops and removes the service.
- Keep device code unique per computer.

## Test Flow

1. Install on one test computer.
2. Confirm service status is running.
3. Open the admin panel.
4. Check that the device appears online within 15-45 seconds.
5. Send a restart test only if safe, or use message after desktop companion is connected.
6. Roll out brand by brand: HP first, then Lenovo, then Acer.
