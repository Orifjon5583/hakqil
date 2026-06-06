import { Activity, Camera, ClipboardList, LayoutDashboard, Maximize2, Monitor, Settings } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../api/client";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Monitor },
  { to: "/snapshots", label: "Snapshots", icon: Camera },
  { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Layout() {
  const location = useLocation();

  if (!getToken()) return <Navigate to="/login" replace />;

  async function requestFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browsers may require a user click for fullscreen.
    }
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-x-0 top-0 z-30 border-b border-line bg-white md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-mint text-white">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold">Robbit Monitor</div>
            <div className="text-xs text-slate-500">v1 Admin</div>
          </div>
        </div>
        <nav className="relative z-40 flex gap-1 overflow-x-auto p-3 md:block">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <a
                key={item.to}
                href={item.to}
                className={`mb-1 flex h-10 w-full shrink-0 cursor-pointer items-center gap-3 rounded px-3 text-left text-sm ${
                  isActive ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>
      <main className="min-h-screen px-4 pb-6 pt-36 md:ml-64 md:px-8 md:py-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={requestFullscreen}
            className="flex h-9 items-center gap-2 rounded border border-line bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
            type="button"
          >
            <Maximize2 size={15} />
            Fullscreen
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
