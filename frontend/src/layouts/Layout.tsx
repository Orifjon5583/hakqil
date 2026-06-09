import { Activity, Camera, ClipboardList, LayoutDashboard, LogOut, Maximize2, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("robbit_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("robbit_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  if (!getToken()) return <Navigate to="/login" replace />;

  function logout() {
    localStorage.removeItem("robbit_token");
    navigate("/login", { replace: true });
  }

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white md:block">
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
              <Link
                key={item.to}
                to={item.to}
                className={`mb-1 flex h-10 w-full shrink-0 cursor-pointer items-center gap-3 rounded px-3 text-left text-sm ${
                  isActive ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-mint text-white">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold">Robbit Monitor</div>
            <div className="text-xs text-slate-500">v1 Admin</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded border border-line bg-white text-slate-700 hover:bg-slate-50"
            type="button"
            title={darkMode ? "Kun rejimi" : "Tungi rejim"}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={requestFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded border border-line bg-white text-slate-700 hover:bg-slate-50"
            type="button"
            title="Fullscreen"
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded border border-line bg-white text-slate-700 hover:bg-slate-50"
            type="button"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-lg md:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded px-1 py-2 text-[11px] font-medium ${
                isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <main className="min-h-screen px-4 pb-28 pt-20 md:ml-64 md:px-8 md:py-6">
        <div className="mb-4 hidden justify-end md:flex">
          <button
            onClick={() => setDarkMode((value) => !value)}
            className="mr-2 flex h-9 items-center gap-2 rounded border border-line bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
            type="button"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? "Kun rejimi" : "Tungi rejim"}
          </button>
          <button
            onClick={requestFullscreen}
            className="flex h-9 items-center gap-2 rounded border border-line bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
            type="button"
          >
            <Maximize2 size={15} />
            Fullscreen
          </button>
          <button
            onClick={logout}
            className="ml-2 flex h-9 items-center gap-2 rounded border border-line bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
            type="button"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
