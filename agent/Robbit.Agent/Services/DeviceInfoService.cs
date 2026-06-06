using System.Net;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using Robbit.Agent.Models;

namespace Robbit.Agent.Services;

public sealed class DeviceInfoService
{
    private readonly RobbitOptions _options;

    public DeviceInfoService(Microsoft.Extensions.Options.IOptions<RobbitOptions> options)
    {
        _options = options.Value;
    }

    public HeartbeatRequest CreateHeartbeat()
    {
        DesktopStatus? desktopStatus = ReadDesktopStatus();

        return new HeartbeatRequest(
            DeviceId: GetStableDeviceId(),
            DeviceCode: _options.DeviceCode,
            Brand: GetBrand(),
            ComputerName: Environment.MachineName,
            Username: Environment.UserName,
            LastActivityAt: DateTimeOffset.UtcNow,
            IpAddress: GetIpAddress(),
            OsVersion: RuntimeInformation.OSDescription,
            AgentVersion: _options.AgentVersion,
            ActiveWindowTitle: desktopStatus?.ActiveWindowTitle,
            ActiveProcessName: desktopStatus?.ActiveProcessName
        );
    }

    private string GetBrand()
    {
        if (!string.IsNullOrWhiteSpace(_options.Brand))
        {
            return _options.Brand.Trim();
        }

        var prefix = _options.DeviceCode.Split('-', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return string.IsNullOrWhiteSpace(prefix) ? "Unknown" : prefix.ToUpperInvariant();
    }

    private static string GetStableDeviceId()
    {
        return $"{Environment.MachineName}-{Environment.UserDomainName}".ToLowerInvariant();
    }

    private static string? GetIpAddress()
    {
        return NetworkInterface.GetAllNetworkInterfaces()
            .Where(n => n.OperationalStatus == OperationalStatus.Up)
            .SelectMany(n => n.GetIPProperties().UnicastAddresses)
            .FirstOrDefault(a => a.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork && !IPAddress.IsLoopback(a.Address))
            ?.Address.ToString();
    }

    private static DesktopStatus? ReadDesktopStatus()
    {
        string path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "RobbitMonitor", "desktop-status.json");
        if (!File.Exists(path)) return null;

        try
        {
            string json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<DesktopStatus>(json);
        }
        catch
        {
            return null;
        }
    }

    private sealed record DesktopStatus(
        [property: JsonPropertyName("activeWindowTitle")] string? ActiveWindowTitle,
        [property: JsonPropertyName("activeProcessName")] string? ActiveProcessName,
        [property: JsonPropertyName("updatedAtUtc")] DateTimeOffset UpdatedAtUtc
    );
}
