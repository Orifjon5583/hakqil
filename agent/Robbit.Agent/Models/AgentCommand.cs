using System.Text.Json;

namespace Robbit.Agent.Models;

public sealed record AgentCommand(
    Guid Id,
    string Type,
    JsonElement Payload,
    DateTimeOffset CreatedAt
);

