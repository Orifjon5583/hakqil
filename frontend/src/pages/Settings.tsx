import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";

type AppSettings = {
  emergencyUnlockPassword: string;
  dailyShutdownEnabled: boolean;
  dailyShutdownTime: string;
  agentUpdateVersion: string;
  agentUpdateUrl: string;
};

const emptySettings: AppSettings = {
  emergencyUnlockPassword: "",
  dailyShutdownEnabled: true,
  dailyShutdownTime: "23:00",
  agentUpdateVersion: "1.0.0",
  agentUpdateUrl: ""
};

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(emptySettings);
  const [status, setStatus] = useState("");

  useEffect(() => {
    api<{ settings: AppSettings }>("/settings")
      .then((response) => setSettings(response.settings))
      .catch(() => setStatus("Sozlamalarni yuklab bo'lmadi"));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus("Saqlanmoqda...");
    try {
      const response = await api<{ settings: AppSettings }>("/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      setSettings(response.settings);
      setStatus("Sozlamalar saqlandi");
    } catch {
      setStatus("Saqlashda xatolik bo'ldi");
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-5 rounded border border-line bg-white p-5">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Qo'lda blokdan ochish paroli</span>
          <input
            className="mt-2 w-full rounded border border-line px-3 py-2"
            value={settings.emergencyUnlockPassword}
            onChange={(event) => setSettings({ ...settings, emergencyUnlockPassword: event.target.value })}
            minLength={8}
            required
          />
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.dailyShutdownEnabled}
            onChange={(event) => setSettings({ ...settings, dailyShutdownEnabled: event.target.checked })}
          />
          <span className="font-medium text-slate-700">Har kuni avtomatik o'chirish yoqilsin</span>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">O'chirish vaqti</span>
          <input
            type="time"
            className="mt-2 w-full rounded border border-line px-3 py-2"
            value={settings.dailyShutdownTime}
            onChange={(event) => setSettings({ ...settings, dailyShutdownTime: event.target.value })}
            required
          />
          <span className="mt-1 block text-xs text-slate-500">Masalan: 23:00. Agent shu vaqtdan keyin update borligini tekshiradi va notebookni o'chiradi.</span>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Agent yangi versiyasi</span>
          <input
            className="mt-2 w-full rounded border border-line px-3 py-2"
            value={settings.agentUpdateVersion}
            onChange={(event) => setSettings({ ...settings, agentUpdateVersion: event.target.value })}
            required
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Agent update ZIP URL</span>
          <input
            className="mt-2 w-full rounded border border-line px-3 py-2"
            placeholder="https://your-domain.uz/downloads/robbit-agent-1.0.1.zip"
            value={settings.agentUpdateUrl}
            onChange={(event) => setSettings({ ...settings, agentUpdateUrl: event.target.value })}
          />
        </label>

        <div className="flex items-center gap-3">
          <button className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white" type="submit">
            Saqlash
          </button>
          {status && <span className="text-sm text-slate-500">{status}</span>}
        </div>
      </form>
    </section>
  );
}
