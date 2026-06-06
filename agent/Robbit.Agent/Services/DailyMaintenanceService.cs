using System.Diagnostics;
using System.IO.Compression;
using Microsoft.Win32;
using Robbit.Agent.Models;

namespace Robbit.Agent.Services;

public sealed class DailyMaintenanceService
{
    private readonly ILogger<DailyMaintenanceService> _logger;
    private readonly RobbitOptions _options;
    private readonly HttpClient _http;
    private DateOnly? _lastShutdownDate;

    public DailyMaintenanceService(
        ILogger<DailyMaintenanceService> logger,
        Microsoft.Extensions.Options.IOptions<RobbitOptions> options,
        HttpClient http)
    {
        _logger = logger;
        _options = options.Value;
        _http = http;
    }

    public async Task RunIfDueAsync(AgentSettings settings, CancellationToken cancellationToken)
    {
        if (!settings.DailyShutdownEnabled) return;
        if (!TimeOnly.TryParse(settings.DailyShutdownTime, out TimeOnly shutdownTime)) return;

        DateTime now = DateTime.Now;
        DateOnly today = DateOnly.FromDateTime(now);
        if (_lastShutdownDate == today) return;
        if (TimeOnly.FromDateTime(now) < shutdownTime) return;

        _lastShutdownDate = today;

        await StageUpdateIfAvailableAsync(settings, cancellationToken);
        Process.Start(new ProcessStartInfo("shutdown", "/s /t 60 /c \"Robbit Monitor daily classroom shutdown\"")
        {
            CreateNoWindow = true,
            UseShellExecute = false
        });
    }

    private async Task StageUpdateIfAvailableAsync(AgentSettings settings, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(settings.AgentUpdateUrl)) return;
        if (string.Equals(settings.AgentUpdateVersion, _options.AgentVersion, StringComparison.OrdinalIgnoreCase)) return;

        string dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "RobbitMonitor", "Update");
        string extractDir = Path.Combine(dataDir, "staged");
        string zipPath = Path.Combine(dataDir, "agent-update.zip");
        Directory.CreateDirectory(dataDir);

        _logger.LogInformation("Downloading Robbit Agent update {Version}", settings.AgentUpdateVersion);
        await using (Stream stream = await _http.GetStreamAsync(settings.AgentUpdateUrl, cancellationToken))
        await using (FileStream file = File.Create(zipPath))
        {
            await stream.CopyToAsync(file, cancellationToken);
        }

        if (Directory.Exists(extractDir)) Directory.Delete(extractDir, true);
        ZipFile.ExtractToDirectory(zipPath, extractDir);

        string installDir = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
        string scriptPath = Path.Combine(dataDir, "apply-update.ps1");
        string script = $"""
        Start-Sleep -Seconds 10
        Copy-Item -Path "{extractDir}\*" -Destination "{installDir}" -Recurse -Force
        Start-Service -Name "Robbit Monitor Agent" -ErrorAction SilentlyContinue
        Start-Process -FilePath "{Path.Combine(installDir, "Robbit.Agent.Desktop.exe")}" -WindowStyle Hidden -ErrorAction SilentlyContinue
        """;
        await File.WriteAllTextAsync(scriptPath, script, cancellationToken);

        using RegistryKey? runOnce = Registry.LocalMachine.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\RunOnce", true);
        runOnce?.SetValue("Robbit Monitor Apply Update", $"powershell.exe -ExecutionPolicy Bypass -File \"{scriptPath}\"");
        _logger.LogInformation("Robbit Agent update staged for next boot: {Version}", settings.AgentUpdateVersion);
    }
}
