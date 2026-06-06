using System.Diagnostics;
using Robbit.Agent.Models;

namespace Robbit.Agent.Services;

public sealed class CommandExecutor
{
    private readonly ILogger<CommandExecutor> _logger;

    public CommandExecutor(ILogger<CommandExecutor> logger)
    {
        _logger = logger;
    }

    public Task<CommandResult> ExecuteAsync(AgentCommand command, CancellationToken cancellationToken)
    {
        try
        {
            return command.Type switch
            {
                "screenshot" => Task.FromResult(Placeholder(command, "Screenshot adapter desktop companion orqali ulanadi.")),
                "camera" => Task.FromResult(Placeholder(command, "Camera adapter desktop companion orqali ulanadi.")),
                "lock" => Task.FromResult(Placeholder(command, "Lock overlay desktop companion orqali ochiladi.")),
                "unlock" => Task.FromResult(Placeholder(command, "Unlock signal desktop companionga yuboriladi.")),
                "message" => Task.FromResult(Placeholder(command, "Message UI desktop companion orqali ko'rsatiladi.")),
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

