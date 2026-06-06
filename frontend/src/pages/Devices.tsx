import { useEffect, useState } from "react";
import { api } from "../api/client";
import { DeviceTable } from "../components/DeviceTable";
import type { Device } from "../types";

const statusFilters = ["Online", "Offline"];

export function Devices() {
  const [active, setActive] = useState("All");
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    api<{ devices: Device[] }>("/devices").then((r) => setDevices(r.devices)).catch(() => setDevices([]));
  }, []);

  const brandFilters = [...new Set(devices.map((device) => device.brand))].sort((a, b) => a.localeCompare(b));
  const filters = ["All", ...brandFilters, ...statusFilters];
  const visibleDevices = devices.filter((device) => {
    if (active === "All") return true;
    if (active === "Online" || active === "Offline") return device.status === active.toLowerCase();
    return device.brand === active;
  });

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Qurilmalar</h1>
        <div className="flex rounded border border-line bg-white p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`h-8 rounded px-3 text-sm ${active === filter ? "bg-ink text-white" : "text-slate-600"}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <DeviceTable devices={visibleDevices} />
      </div>
    </section>
  );
}
