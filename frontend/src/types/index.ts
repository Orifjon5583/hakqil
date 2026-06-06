export type DeviceStatus = "online" | "offline";

export type Device = {
  id: string;
  device_code: string;
  brand: string;
  computer_name: string | null;
  windows_username: string | null;
  status: DeviceStatus;
  last_seen_at: string | null;
  ip_address: string | null;
  os_version: string | null;
  agent_version: string | null;
  active_window_title: string | null;
  active_process_name: string | null;
};
