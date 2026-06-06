import { Eye, EyeOff, Save } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    api<{ settings: AppSettings }>("/settings")
      .then((response) => setSettings(response.settings))
      .catch(() => setStatus("Sozlamalarni yuklab bo'lmadi"));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus("Saqlanmoqda...");
    const trimmedUpdateUrl = settings.agentUpdateUrl.trim();
    if (trimmedUpdateUrl && !/^https?:\/\//i.test(trimmedUpdateUrl)) {
      setStatus("Agent update ZIP URL noto'g'ri. Bo'sh qoldiring yoki http/https URL yozing.");
      return;
    }

    try {
      const payload = {
        ...settings,
        emergencyUnlockPassword: settings.emergencyUnlockPassword.trim(),
        agentUpdateVersion: settings.agentUpdateVersion.trim(),
        agentUpdateUrl: trimmedUpdateUrl
      };
      const response = await api<{ settings: AppSettings }>("/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setSettings(response.settings);
      setStatus("Sozlamalar saqlandi. Agentlar keyingi heartbeatda yangi parolni oladi.");
    } catch (error) {
      setStatus(error instanceof Error ? `Saqlashda xatolik: ${error.message}` : "Saqlashda xatolik bo'ldi");
    }
  }

  return (
    <section>
      <form onSubmit={save} className="max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <button className="flex h-10 items-center gap-2 rounded bg-mint px-4 text-sm font-semibold text-white hover:bg-ink" type="submit">
            <Save size={16} />
            Saqlash
          </button>
        </div>

        <div className="space-y-5 rounded border border-line bg-white p-5">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Qo'lda blokdan ochish paroli</span>
          <div className="mt-2 flex rounded border border-line bg-white">
            <input
              type={showPassword ? "text" : "password"}
              className="h-11 min-w-0 flex-1 rounded-l px-3 outline-none"
              value={settings.emergencyUnlockPassword}
              onChange={(event) => setSettings({ ...settings, emergencyUnlockPassword: event.target.value })}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="flex h-11 w-12 items-center justify-center border-l border-line text-slate-600 hover:bg-slate-50"
              title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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

        <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center gap-3 border-t border-line bg-white p-5">
          <button className="flex h-10 items-center gap-2 rounded bg-mint px-4 text-sm font-semibold text-white hover:bg-ink" type="submit">
            <Save size={16} />
            Saqlash
          </button>
          {status && <span className="text-sm text-slate-500">{status}</span>}
        </div>
        </div>
      </form>
    </section>
  );
}
