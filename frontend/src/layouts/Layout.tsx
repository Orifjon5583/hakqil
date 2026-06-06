import { Activity, Camera, ClipboardList, LayoutDashboard, Monitor, Settings } from "lucide-react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { getToken } from "../api/client";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Monitor },
  { to: "/snapshots", label: "Snapshots", icon: Camera },
  { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Layout() {
  if (!getToken()) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-line bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-mint text-white">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold">Robbit Monitor</div>
            <div className="text-xs text-slate-500">v1 Admin</div>
          </div>
        </div>
        <nav className="p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `mb-1 flex h-10 items-center gap-3 rounded px-3 text-sm ${
                    isActive ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="ml-64 min-h-screen px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

