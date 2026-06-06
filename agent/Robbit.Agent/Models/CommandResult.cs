namespace Robbit.Agent.Models;

public sealed record CommandResult(
    Guid CommandId,
    string Status,
    object? Result = null,
    string? ErrorMessage = null
);

