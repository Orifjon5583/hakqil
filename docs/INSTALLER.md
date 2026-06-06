# Installer Structure

The Windows agent is a .NET Worker Service starter. Production installer packaging should wrap the published agent files and register the Windows Service.

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
    "HeartbeatSeconds": 15
  }
}
```

## Publish

On a machine with .NET SDK:

```powershell
cd agent\Robbit.Agent
dotnet publish -c Release -r win-x64 --self-contained true
```

## Install Service

Run PowerShell as Administrator:

```powershell
sc.exe create "Robbit Monitor Agent" binPath= "C:\Robbit\Robbit.Agent.exe" start= auto
sc.exe start "Robbit Monitor Agent"
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
5. Send a message command and confirm command polling works.
