import { Link } from "react-router-dom";
import type { Device } from "../types";
import { StatusBadge } from "./StatusBadge";

export function DeviceTable({ devices }: { devices: Device[] }) {
  return (
    <>
    <div className="space-y-3 md:hidden">
      {devices.map((device) => (
        <Link
          key={device.id}
          to={`/devices/${device.id}`}
          className="block rounded border border-line bg-white p-4 text-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{device.device_code}</div>
              <div className="mt-1 text-xs text-slate-500">{device.computer_name ?? "-"}</div>
            </div>
            <StatusBadge status={device.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="uppercase text-slate-500">Brand</div>
              <div className="mt-1 font-medium">{device.brand}</div>
            </div>
            <div>
              <div className="uppercase text-slate-500">IP</div>
              <div className="mt-1 font-medium">{device.ip_address ?? "-"}</div>
            </div>
            <div>
              <div className="uppercase text-slate-500">User</div>
              <div className="mt-1 truncate font-medium">{device.windows_username ?? "-"}</div>
            </div>
            <div>
              <div className="uppercase text-slate-500">Last Seen</div>
              <div className="mt-1 font-medium">{device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "-"}</div>
            </div>
          </div>
          <div className="mt-3 border-t border-line pt-3 text-xs text-slate-600">
            <div className="uppercase text-slate-500">Nima qilyapti</div>
            <div className="mt-1 line-clamp-2">
              {device.active_process_name ? `${device.active_process_name}: ` : ""}
              {device.active_window_title ?? "-"}
            </div>
          </div>
        </Link>
      ))}
    </div>

    <div className="hidden overflow-hidden rounded border border-line bg-white md:block">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="border-b border-line bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Device Code</th>
            <th className="px-4 py-3">Brand</th>
            <th className="px-4 py-3">Computer Name</th>
            <th className="px-4 py-3">Windows Username</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">IP Address</th>
            <th className="px-4 py-3">Nima qilyapti</th>
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
              <td className="max-w-xs truncate px-4 py-3" title={device.active_window_title ?? undefined}>
                {device.active_process_name ? `${device.active_process_name}: ` : ""}
                {device.active_window_title ?? "-"}
              </td>
              <td className="px-4 py-3">{device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "-"}</td>
              <td className="px-4 py-3">
                <Link className="text-mint hover:underline" to={`/devices/${device.id}`}>Detail</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
