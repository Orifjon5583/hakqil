import { Link } from "react-router-dom";
import type { Device } from "../types";
import { StatusBadge } from "./StatusBadge";

export function DeviceTable({ devices }: { devices: Device[] }) {
  return (
    <div className="overflow-hidden rounded border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Device Code</th>
            <th className="px-4 py-3">Brand</th>
            <th className="px-4 py-3">Computer Name</th>
            <th className="px-4 py-3">Windows Username</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">IP Address</th>
            <th className="px-4 py-3">Last Seen</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-medium">{device.device_code}</td>
              <td className="px-4 py-3">{device.brand}</td>
              <td className="px-4 py-3">{device.computer_name ?? "-"}</td>
              <td className="px-4 py-3">{device.windows_username ?? "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={device.status} /></td>
              <td className="px-4 py-3">{device.ip_address ?? "-"}</td>
              <td className="px-4 py-3">{device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "-"}</td>
              <td className="px-4 py-3">
                <Link className="text-mint hover:underline" to={`/devices/${device.id}`}>Detail</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
