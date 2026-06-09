import { Eye, EyeOff, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { DeviceTable } from "../components/DeviceTable";
import type { Device } from "../types";

const statusFilters = ["Online", "Offline"];

type AgentTokenResult = {
  token: string;
  deviceCode: string;
  brand: string;
  apiBaseUrl: string;
  expiresInDays: number;
  installCommand: string;
};

export function Devices() {
  const [active, setActive] = useState("All");
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceCode, setDeviceCode] = useState("");
  const [brand, setBrand] = useState("");
  const [tokenResult, setTokenResult] = useState<AgentTokenResult | null>(null);
  const [tokenStatus, setTokenStatus] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);

  const defaultApiBaseUrl = useMemo(() => `${window.location.origin}/api`, []);

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

  async function createAgentToken(event: FormEvent) {
    event.preventDefault();
    setTokenStatus("Token yaratilmoqda...");
    setTokenResult(null);

    try {
      const result = await api<AgentTokenResult>("/devices/agent-token", {
        method: "POST",
        body: JSON.stringify({
          deviceCode,
          brand,
          apiBaseUrl: defaultApiBaseUrl
        })
      });
      setTokenResult(result);
      setShowToken(false);
      setDeviceCode(result.deviceCode);
      setBrand(result.brand);
      setTokenStatus("Token tayyor. Bu tokenni faqat shu kompyuter installida ishlating.");
    } catch (error) {
      setTokenStatus(error instanceof Error ? `Xatolik: ${error.message}` : "Token yaratib bo'lmadi");
    }
  }

  async function copyInstallCommand() {
    if (!tokenResult) return;
    await navigator.clipboard.writeText(tokenResult.installCommand);
    setTokenStatus("Install command nusxalandi.");
  }

  async function copyToken() {
    if (!tokenResult) return;
    await navigator.clipboard.writeText(tokenResult.token);
    setTokenStatus("Token nusxalandi.");
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Qurilmalar</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="flex h-10 items-center justify-center gap-2 rounded bg-mint px-4 text-sm font-medium text-white"
          type="button"
          onClick={() => setShowAddDevice((value) => !value)}
        >
          {showAddDevice ? <X size={16} /> : <Plus size={16} />}
          {showAddDevice ? "Yopish" : "Kompyuter qo'shish"}
        </button>
        <div className="flex max-w-full overflow-x-auto rounded border border-line bg-white p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`h-8 shrink-0 rounded px-3 text-sm ${active === filter ? "bg-ink text-white" : "text-slate-600"}`}
            >
              {filter}
            </button>
          ))}
        </div>
        </div>
      </div>
      <div className="mt-5">
        <DeviceTable devices={visibleDevices} />
      </div>

      {showAddDevice && (
      <form onSubmit={createAgentToken} className="mt-6 rounded border border-line bg-white p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Kompyuter qo'shish</h2>
            <p className="text-xs text-slate-500">Device code va brand kiriting, agent token va install command oling.</p>
          </div>
          <button className="mt-3 h-10 rounded bg-ink px-4 text-sm font-medium text-white sm:mt-0" type="submit">
            Token yaratish
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-slate-700">Device Code</span>
            <input
              className="mt-2 h-10 w-full rounded border border-line px-3 uppercase"
              placeholder="HP-01"
              value={deviceCode}
              onChange={(event) => setDeviceCode(event.target.value.toUpperCase())}
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Brand</span>
            <input
              className="mt-2 h-10 w-full rounded border border-line px-3"
              placeholder="HP"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              required
            />
          </label>
        </div>

        {tokenResult && (
          <div className="mt-4 space-y-3 rounded border border-line bg-slate-50 p-3">
            <div>
              <div className="text-xs uppercase text-slate-500">Agent token</div>
              <div className="mt-2 flex rounded border border-line bg-white">
                <input
                  className="h-10 min-w-0 flex-1 rounded-l px-3 font-mono text-xs outline-none"
                  readOnly
                  type={showToken ? "text" : "password"}
                  value={tokenResult.token}
                />
                <button
                  className="flex h-10 w-11 items-center justify-center border-l border-line text-slate-600 hover:bg-slate-50"
                  type="button"
                  onClick={() => setShowToken((value) => !value)}
                  title={showToken ? "Tokenni yashirish" : "Tokenni ko'rsatish"}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  className="h-10 border-l border-line px-3 text-sm text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={copyToken}
                >
                  Tokenni olish
                </button>
              </div>
            </div>
            <div>
            <div className="text-xs uppercase text-slate-500">Install command</div>
            <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-all rounded bg-white p-3 text-xs">{tokenResult.installCommand}</pre>
            <button className="mt-3 h-9 rounded border border-line bg-white px-3 text-sm text-slate-700" type="button" onClick={copyInstallCommand}>
              Nusxa olish
            </button>
            </div>
          </div>
        )}

        {tokenStatus && <div className="mt-3 text-sm text-slate-500">{tokenStatus}</div>}
      </form>
      )}
    </section>
  );
}
