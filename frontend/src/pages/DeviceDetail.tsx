import { Camera, Lock, MessageSquare, Power, RotateCcw, ScreenShare, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { Device } from "../types";

const actions = [
  { path: "screenshot", label: "Screenshot olish", icon: ScreenShare },
  { path: "camera", label: "Camera snapshot olish", icon: Camera },
  { path: "lock", label: "Lock screen", icon: Lock },
  { path: "unlock", label: "Unlock screen", icon: Unlock },
  { path: "restart", label: "Restart", icon: RotateCcw },
  { path: "shutdown", label: "Shutdown", icon: Power }
];

type AuditLog = {
  id: string;
  username: string | null;
  device_code: string | null;
  action: string;
  created_at: string;
};

export function DeviceDetail() {
  const { id } = useParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [message, setMessage] = useState("Darsga e'tibor bering");

  useEffect(() => {
    if (!id) return;
    api<{ device: Device }>(`/devices/${id}`).then((r) => setDevice(r.device));
    api<{ auditLogs: AuditLog[] }>("/audit-logs").then((r) => setLogs(r.auditLogs)).catch(() => setLogs([]));
  }, [id]);

  async function run(path: string, payload?: Record<string, unknown>) {
    if (!id) return;
    await api(`/devices/${id}/${path}`, { method: "POST", body: JSON.stringify(payload ?? {}) });
  }

  if (!device) return <div>Loading...</div>;

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{device.device_code}</h1>
          <div className="mt-2"><StatusBadge status={device.status} /></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {[
          ["Computer Name", device.computer_name],
          ["Username", device.windows_username],
          ["Brand", device.brand],
          ["Device Code", device.device_code],
          ["Last Seen", device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "-"],
          ["IP Address", device.ip_address],
          ["Active Process", device.active_process_name],
          ["Active Window", device.active_window_title],
          ["OS Version", device.os_version],
          ["Agent Version", device.agent_version]
        ].map(([k, v]) => (
          <div key={k} className="rounded border border-line bg-white p-4">
            <div className="text-xs uppercase text-slate-500">{k}</div>
            <div className="mt-1 font-medium">{v ?? "-"}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded border border-line bg-white p-4">
        <div className="mb-3 text-sm font-semibold">Tugmalar</div>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.path} onClick={() => run(action.path)} className="flex h-10 items-center justify-center gap-2 rounded border border-line text-sm hover:bg-slate-50">
                <Icon size={16} />
                {action.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="h-10 flex-1 rounded border border-line px-3 text-sm" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={() => run("message", { message })} className="flex h-10 items-center gap-2 rounded bg-ink px-4 text-sm text-white">
            <MessageSquare size={16} />
            Message yuborish
          </button>
        </div>
      </div>

      <div className="mt-6 rounded border border-line bg-white p-4">
        <div className="mb-3 text-sm font-semibold">Lock history</div>
        <div className="space-y-3">
          {logs
            .filter((log) => log.device_code === device.device_code && (log.action === "Lock qilindi" || log.action === "Unlock qilindi"))
            .slice(0, 8)
            .map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{log.action}</div>
                  <div className="text-xs text-slate-500">{log.username ?? "-"}</div>
                </div>
                <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
              </div>
            ))}
          {logs.filter((log) => log.device_code === device.device_code && (log.action === "Lock qilindi" || log.action === "Unlock qilindi")).length === 0 && (
            <div className="text-sm text-slate-500">Lock/Unlock tarixi hali yo'q</div>
          )}
        </div>
      </div>
    </section>
  );
}
