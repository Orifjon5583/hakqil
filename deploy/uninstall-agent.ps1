param(
    [string] $InstallPath = "$env:ProgramFiles\Robbit Monitor Agent",
    [string] $ServiceName = "Robbit Monitor Agent",
    [switch] $KeepConfig
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

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing) {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

$runKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
Remove-ItemProperty -Path $runKey -Name "Robbit Monitor Desktop" -ErrorAction SilentlyContinue

if ((Test-Path $InstallPath) -and -not $KeepConfig) {
    Remove-Item -LiteralPath $InstallPath -Recurse -Force
}

Write-Host "Robbit Agent olib tashlandi."
