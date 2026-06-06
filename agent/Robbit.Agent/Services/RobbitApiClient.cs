using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using Robbit.Agent.Models;

namespace Robbit.Agent.Services;

public sealed class RobbitApiClient
{
    private readonly HttpClient _http;
    private readonly RobbitOptions _options;

    public RobbitApiClient(HttpClient http, IOptions<RobbitOptions> options)
    {
        _http = http;
        _options = options.Value;
        _http.BaseAddress = new Uri(_options.ApiBaseUrl.TrimEnd('/') + "/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.AgentToken);
    }

    public async Task SendHeartbeatAsync(HeartbeatRequest heartbeat, CancellationToken cancellationToken)
    {
        using HttpResponseMessage response = await _http.PostAsJsonAsync("agent/heartbeat", heartbeat, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<IReadOnlyList<AgentCommand>> GetCommandsAsync(string deviceId, CancellationToken cancellationToken)
    {
        AgentCommandsResponse? response = await _http.GetFromJsonAsync<AgentCommandsResponse>(
            $"agent/commands?deviceId={Uri.EscapeDataString(deviceId)}",
            cancellationToken
        );

        return response?.Commands ?? Array.Empty<AgentCommand>();
    }

    public async Task SendResultAsync(CommandResult result, CancellationToken cancellationToken)
    {
        using HttpResponseMessage response = await _http.PostAsJsonAsync("agent/result", result, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<AgentSettings?> GetSettingsAsync(CancellationToken cancellationToken)
    {
        AgentSettingsResponse? response = await _http.GetFromJsonAsync<AgentSettingsResponse>("agent/settings", cancellationToken);
        return response?.Settings;
    }

    private sealed record AgentCommandsResponse(IReadOnlyList<AgentCommand> Commands);
    private sealed record AgentSettingsResponse(AgentSettings Settings);
}
