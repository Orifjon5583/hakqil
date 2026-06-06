import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";

type Snapshot = {
  id: string;
  type: "screenshot" | "camera";
  file_path: string;
  taken_at: string;
  device_code: string;
  computer_name: string | null;
};

export function Snapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  async function load() {
    const result = await api<{ snapshots: Snapshot[] }>("/snapshots");
    setSnapshots(result.snapshots);
  }

  useEffect(() => { load().catch(() => setSnapshots([])); }, []);

  async function remove(id: string) {
    await api(`/snapshots/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Snapshot gallery</h1>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {snapshots.map((item) => (
          <div key={item.id} className="overflow-hidden rounded border border-line bg-white">
            <div className="aspect-video bg-slate-200">
              <img className="h-full w-full object-cover" src={item.file_path} alt={`${item.device_code} ${item.type}`} />
            </div>
            <div className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-medium">{item.device_code}</div>
                <div className="text-xs text-slate-500">{new Date(item.taken_at).toLocaleString()}</div>
              </div>
              <button onClick={() => remove(item.id)} className="rounded p-2 text-coral hover:bg-red-50" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

