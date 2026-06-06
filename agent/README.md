# Robbit Agent

C# .NET Windows Service starter.

## Build

```powershell
cd Robbit.Agent
dotnet build
```

## Windows Service install

```powershell
sc.exe create "Robbit Monitor Agent" binPath= "C:\Path\To\Robbit.Agent.exe" start= auto
sc.exe start "Robbit Monitor Agent"
```

## Eslatma

Screenshot, camera, lock overlay va message UI professional tarzda alohida desktop companion orqali bajarilishi kerak. Windows Service user desktop bilan to'g'ridan-to'g'ri ishlamaydi.

