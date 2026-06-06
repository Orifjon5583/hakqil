using Microsoft.Extensions.Options;
using Robbit.Agent.Services;

namespace Robbit.Agent;

public sealed class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly RobbitOptions _options;
    private readonly DeviceInfoService _deviceInfo;
    private readonly RobbitApiClient _api;
    private readonly CommandExecutor _executor;
    private readonly AgentSettingsCache _settings;
    private readonly DailyMaintenanceService _maintenance;

    public Worker(
        ILogger<Worker> logger,
        IOptions<RobbitOptions> options,
        DeviceInfoService deviceInfo,
        RobbitApiClient api,
        CommandExecutor executor,
        AgentSettingsCache settings,
        DailyMaintenanceService maintenance)
    {
        _logger = logger;
        _options = options.Value;
        _deviceInfo = deviceInfo;
        _api = api;
        _executor = executor;
        _settings = settings;
        _maintenance = maintenance;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        TimeSpan interval = TimeSpan.FromSeconds(Math.Max(5, _options.HeartbeatSeconds));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var heartbeat = _deviceInfo.CreateHeartbeat();
                await _api.SendHeartbeatAsync(heartbeat, stoppingToken);

                var settings = await _api.GetSettingsAsync(stoppingToken);
                if (settings is not null)
                {
                    _settings.Update(settings);
                    await _maintenance.RunIfDueAsync(settings, stoppingToken);
                }

                var commands = await _api.GetCommandsAsync(heartbeat.DeviceId, stoppingToken);
                foreach (var command in commands)
                {
                    var result = await _executor.ExecuteAsync(command, stoppingToken);
                    await _api.SendResultAsync(result, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Robbit agent loop failed");
            }

            await Task.Delay(interval, stoppingToken);
        }
    }
}
