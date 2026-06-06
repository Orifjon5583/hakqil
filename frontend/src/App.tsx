import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { AuditLogs } from "./pages/AuditLogs";
import { Dashboard } from "./pages/Dashboard";
import { DeviceDetail } from "./pages/DeviceDetail";
import { Devices } from "./pages/Devices";
import { Login } from "./pages/Login";
import { Settings } from "./pages/Settings";
import { Snapshots } from "./pages/Snapshots";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/snapshots" element={<Snapshots />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

