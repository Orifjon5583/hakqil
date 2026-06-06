import { useEffect, useState } from "react";
import { api } from "../api/client";

type AuditLog = {
  id: string;
  username: string | null;
  device_code: string | null;
  action: string;
  created_at: string;
};

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api<{ auditLogs: AuditLog[] }>("/audit-logs").then((r) => setLogs(r.auditLogs)).catch(() => setLogs([]));
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <div className="mt-6 overflow-hidden rounded border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Kim</th>
              <th className="px-4 py-3">Qaysi kompyuter</th>
              <th className="px-4 py-3">Amal</th>
              <th className="px-4 py-3">Qachon</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{log.username ?? "-"}</td>
                <td className="px-4 py-3">{log.device_code ?? "-"}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

