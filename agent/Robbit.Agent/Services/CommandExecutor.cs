using System.Diagnostics;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Robbit.Agent.Models;

namespace Robbit.Agent.Services;

public sealed class CommandExecutor
{
    private readonly ILogger<CommandExecutor> _logger;
    private readonly AgentSettingsCache _settings;

    public CommandExecutor(ILogger<CommandExecutor> logger, AgentSettingsCache settings)
    {
        _logger = logger;
        _settings = settings;
    }

    public Task<CommandResult> ExecuteAsync(AgentCommand command, CancellationToken cancellationToken)
    {
        try
        {
            return command.Type switch
            {
                "screenshot" => Task.FromResult(Placeholder(command, "Screenshot adapter desktop companion orqali ulanadi.")),
                "camera" => Task.FromResult(Placeholder(command, "Camera adapter desktop companion orqali ulanadi.")),
                "lock" => WriteDesktopCommandAsync(command, "lock", GetMessage(command) ?? "Kompyuter vaqtincha bloklandi."),
                "unlock" => WriteDesktopCommandAsync(command, "unlock", null),
                "message" => WriteDesktopCommandAsync(command, "message", GetMessage(command) ?? "Admin xabari."),
                "restart" => RestartAsync(command),
                "shutdown" => ShutdownAsync(command),
                _ => Task.FromResult(new CommandResult(command.Id, "failed", ErrorMessage: $"Unknown command: {command.Type}"))
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Command failed {CommandId}", command.Id);
            return Task.FromResult(new CommandResult(command.Id, "failed", ErrorMessage: ex.Message));
        }
    }

    private static CommandResult Placeholder(AgentCommand command, string message)
    {
        return new CommandResult(command.Id, "completed", new { message });
    }

    private async Task<CommandResult> WriteDesktopCommandAsync(AgentCommand command, string action, string? message)
    {
        string directory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "RobbitMonitor");
        Directory.CreateDirectory(directory);

        string path = Path.Combine(directory, "desktop-command.json");
        var payload = new
        {
            action,
            message,
            emergencyUnlockPasswordHash = Sha256(_settings.Current.EmergencyUnlockPassword),
            createdAtUtc = DateTimeOffset.UtcNow
        };

        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(payload), CancellationToken.None);
        return new CommandResult(command.Id, "completed", new { message = $"Desktop command queued: {action}" });
    }

    private static string? GetMessage(AgentCommand command)
    {
        if (command.Payload.ValueKind != JsonValueKind.Object) return null;
        return command.Payload.TryGetProperty("message", out JsonElement value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
    }

    private static string Sha256(string value)
    {
        byte[] bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static Task<CommandResult> RestartAsync(AgentCommand command)
    {
        Process.Start(new ProcessStartInfo("shutdown", "/r /t 30 /c \"Robbit Monitor admin restart command\"")
        {
            CreateNoWindow = true,
            UseShellExecute = false
        });
        return Task.FromResult(new CommandResult(command.Id, "completed", new { message = "Restart scheduled in 30 seconds" }));
    }

    private static Task<CommandResult> ShutdownAsync(AgentCommand command)
    {
        Process.Start(new ProcessStartInfo("shutdown", "/s /t 30 /c \"Robbit Monitor admin shutdown command\"")
        {
            CreateNoWindow = true,
            UseShellExecute = false
        });
        return Task.FromResult(new CommandResult(command.Id, "completed", new { message = "Shutdown scheduled in 30 seconds" }));
    }
}
