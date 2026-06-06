using Robbit.Agent.Models;

namespace Robbit.Agent.Services;

public sealed class AgentSettingsCache
{
    private readonly RobbitOptions _options;

    public AgentSettingsCache(Microsoft.Extensions.Options.IOptions<RobbitOptions> options)
    {
        _options = options.Value;
        Current = new AgentSettings(
            _options.EmergencyUnlockPassword,
            true,
            "23:00",
            _options.AgentVersion,
            ""
        );
    }

    public AgentSettings Current { get; private set; }

    public void Update(AgentSettings settings)
    {
        Current = settings;
    }
}
