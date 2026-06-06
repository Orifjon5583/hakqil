namespace Robbit.Agent;

public sealed class RobbitOptions
{
    public string ApiBaseUrl { get; set; } = "";
    public string AgentToken { get; set; } = "";
    public string DeviceCode { get; set; } = "";
    public string Brand { get; set; } = "";
    public string AgentVersion { get; set; } = "1.0.0";
    public int HeartbeatSeconds { get; set; } = 15;
    public string EmergencyUnlockPassword { get; set; } = "";
}
