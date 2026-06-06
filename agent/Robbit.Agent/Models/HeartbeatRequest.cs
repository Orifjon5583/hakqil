namespace Robbit.Agent.Models;

public sealed record HeartbeatRequest(
    string DeviceId,
    string DeviceCode,
    string Brand,
    string ComputerName,
    string Username,
    DateTimeOffset LastActivityAt,
    string? IpAddress,
    string OsVersion,
    string AgentVersion,
    string? ActiveWindowTitle,
    string? ActiveProcessName
);
