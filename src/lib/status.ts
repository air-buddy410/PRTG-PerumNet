import type { DeviceStatus } from "@/types/device";

export const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: "#22c55e",
  warning: "#eab308",
  offline: "#ef4444",
};

export const STATUS_LABELS: Record<DeviceStatus, string> = {
  online: "Online",
  warning: "Warning",
  offline: "Offline",
};
