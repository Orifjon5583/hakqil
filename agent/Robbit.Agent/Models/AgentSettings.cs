using System.Text.Json.Serialization;

namespace Robbit.Agent.Models;

public sealed record AgentSettings(
    [property: JsonPropertyName("emergencyUnlockPassword")]
    string EmergencyUnlockPassword,
    [property: JsonPropertyName("dailyShutdownEnabled")]
    bool DailyShutdownEnabled,
    [property: JsonPropertyName("dailyShutdownTime")]
    string DailyShutdownTime,
    [property: JsonPropertyName("agentUpdateVersion")]
    string AgentUpdateVersion,
    [property: JsonPropertyName("agentUpdateUrl")]
    string AgentUpdateUrl
);
