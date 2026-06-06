# Robbit Agent

C# .NET Windows Service starter.

## Build

```powershell
cd Robbit.Agent
dotnet build
```

## Windows Service install

```powershell
dotnet publish -c Release -r win-x64 --self-contained true -o ..\..\deploy\publish
cd ..\Robbit.Agent.Desktop
dotnet publish -c Release -r win-x64 --self-contained true -o ..\..\deploy\publish
cd ..\..\deploy
.\install-agent.ps1 -ApiBaseUrl "https://your-domain.uz/api" -AgentToken "TOKEN" -DeviceCode "HP-01" -Brand "HP" -EmergencyUnlockPassword 'CHANGE_EMERGENCY_UNLOCK_PASSWORD'
```

## Eslatma

Screenshot, camera, lock overlay va message UI professional tarzda alohida desktop companion orqali bajarilishi kerak. Windows Service user desktop bilan to'g'ridan-to'g'ri ishlamaydi.
