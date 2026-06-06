param(
    [Parameter(Mandatory = $true)]
    [string] $ApiBaseUrl,

    [Parameter(Mandatory = $true)]
    [string] $AgentToken,

    [Parameter(Mandatory = $true)]
    [string] $DeviceCode,

    [Parameter(Mandatory = $true)]
    [string] $Brand,

    [string] $SourcePath = ".\publish",
    [string] $InstallPath = "$env:ProgramFiles\Robbit Monitor Agent",
    [string] $ServiceName = "Robbit Monitor Agent",
    [int] $HeartbeatSeconds = 15,
    [string] $EmergencyUnlockPassword = "CHANGE_EMERGENCY_UNLOCK_PASSWORD"
)

$ErrorActionPreference = "Stop"

function Assert-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "PowerShell'ni Administrator sifatida ishga tushiring."
    }
}

Assert-Admin

if (-not (Test-Path $SourcePath)) {
    throw "Publish papkasi topilmadi: $SourcePath. Avval dotnet publish qiling."
}

$exeSource = Join-Path $SourcePath "Robbit.Agent.exe"
if (-not (Test-Path $exeSource)) {
    throw "Robbit.Agent.exe topilmadi: $exeSource"
}

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing) {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
Copy-Item -Path (Join-Path $SourcePath "*") -Destination $InstallPath -Recurse -Force

$programDataPath = Join-Path $env:ProgramData "RobbitMonitor"
New-Item -ItemType Directory -Force -Path $programDataPath | Out-Null
icacls $programDataPath /grant "*S-1-5-32-545:(OI)(CI)M" | Out-Null

$settings = @{
    Robbit = @{
        ApiBaseUrl = $ApiBaseUrl.TrimEnd("/")
        AgentToken = $AgentToken
        DeviceCode = $DeviceCode
        Brand = $Brand
        AgentVersion = "1.0.0"
        HeartbeatSeconds = $HeartbeatSeconds
        EmergencyUnlockPassword = $EmergencyUnlockPassword
    }
}

$settingsPath = Join-Path $InstallPath "appsettings.json"
$settings | ConvertTo-Json -Depth 4 | Set-Content -Path $settingsPath -Encoding UTF8
icacls $settingsPath /inheritance:r /grant "SYSTEM:F" /grant "Administrators:F" | Out-Null

$exePath = Join-Path $InstallPath "Robbit.Agent.exe"
sc.exe create $ServiceName binPath= "`"$exePath`"" start= auto | Out-Null
sc.exe description $ServiceName "Robbit Monitor authorized classroom monitoring agent" | Out-Null
Start-Service -Name $ServiceName

$desktopExe = Join-Path $InstallPath "Robbit.Agent.Desktop.exe"
if (Test-Path $desktopExe) {
    $runKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
    New-ItemProperty -Path $runKey -Name "Robbit Monitor Desktop" -Value "`"$desktopExe`"" -PropertyType String -Force | Out-Null
    Start-Process -FilePath $desktopExe -WindowStyle Hidden
    Write-Host "Desktop companion autostart sozlandi."
} else {
    Write-Warning "Robbit.Agent.Desktop.exe topilmadi. Lock/message oynalari user sessionda chiqmaydi."
}

Write-Host "Robbit Agent o'rnatildi: $DeviceCode ($Brand)"
Write-Host "Service: $ServiceName"
Write-Host "InstallPath: $InstallPath"
