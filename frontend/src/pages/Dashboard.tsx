import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { StatCard } from "../components/StatCard";
import type { Device } from "../types";

type Snapshot = {
  id: string;
  type: "screenshot" | "camera";
  file_path: string;
  taken_at: string;
  device_code: string;
  computer_name: string | null;
};

type AuditLog = {
  id: string;
  username: string | null;
  device_code: string | null;
  action: string;
  created_at: string;
};

export function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api<{ devices: Device[] }>("/devices").then((r) => setDevices(r.devices)).catch(() => setDevices([]));
    api<{ snapshots: Snapshot[] }>("/snapshots").then((r) => setSnapshots(r.snapshots.slice(0, 4))).catch(() => setSnapshots([]));
    api<{ auditLogs: AuditLog[] }>("/audit-logs").then((r) => setLogs(r.auditLogs.slice(0, 6))).catch(() => setLogs([]));
  }, []);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter((d) => d.status === "online").length,
    offline: devices.filter((d) => d.status === "offline").length
  }), [devices]);

  const brandStats = useMemo(() => {
    return [...devices.reduce((items, device) => {
      items.set(device.brand, (items.get(device.brand) ?? 0) + 1);
      return items;
    }, new Map<string, number>())].sort(([a], [b]) => a.localeCompare(b));
  }, [devices]);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard title="Jami qurilmalar" value={stats.total} />
        <StatCard title="Online qurilmalar" value={stats.online} />
        <StatCard title="Offline qurilmalar" value={stats.offline} />
        {brandStats.map(([brand, count]) => (
          <StatCard key={brand} title={`${brand} soni`} value={count} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold">Oxirgi snapshotlar</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {snapshots.length === 0 && (
              <div className="col-span-2 rounded border border-line bg-white p-4 text-sm text-slate-500">Snapshotlar hali yo'q</div>
            )}
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="overflow-hidden rounded border border-line bg-white">
                <div className="aspect-video bg-slate-100">
                  <img className="h-full w-full object-cover" src={snapshot.file_path} alt={`${snapshot.device_code} ${snapshot.type}`} />
                </div>
                <div className="p-3 text-sm">
                  <div className="font-medium">{snapshot.device_code}</div>
                  <div className="text-xs text-slate-500">{new Date(snapshot.taken_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Oxirgi buyruqlar</h2>
          <div className="mt-3 overflow-hidden rounded border border-line bg-white">
            {logs.length === 0 && <div className="p-4 text-sm text-slate-500">Buyruqlar hali yo'q</div>}
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b border-line px-4 py-3 text-sm last:border-0">
                <div>
                  <div className="font-medium">{log.action}</div>
                  <div className="text-xs text-slate-500">{log.device_code ?? "-"} / {log.username ?? "-"}</div>
                </div>
                <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
