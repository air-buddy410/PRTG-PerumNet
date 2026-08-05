import { MOCK_DEVICES } from "@/lib/mock-devices";
import {
  advancePortBandwidth,
  advanceTemperature,
  advanceUsageSeries,
  type PortBandwidth,
  type TemperatureReading,
  type UsagePoint,
} from "@/lib/mock-metrics";
import type {
  DeviceGroup,
  DeviceStatus,
  NetworkDevice,
} from "@/types/device";

// Kontrak respons GET /api/devices — updatedAt = waktu sinkronisasi cache
// (lihat arsitektur PRD: worker menarik data PRTG tiap 10 detik ke Redis).
export interface DevicesResponse {
  devices: NetworkDevice[];
  updatedAt: string;
}

const STATUSES: DeviceStatus[] = ["online", "warning", "offline"];

// State mock mandiri di memori: status berevolusi dari kondisi sebelumnya
// (perangkat yang padam tetap padam sampai "pulih"), meniru perilaku PRTG
// asli — bukan diacak ulang dari baseline pada tiap penarikan.
let currentDevices: NetworkDevice[] = MOCK_DEVICES.map((device) => ({
  ...device,
}));

// Stub sementara pengganti backend GET /api/devices.
export async function fetchDevices(): Promise<DevicesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  currentDevices = currentDevices.map((device) => {
    if (Math.random() < 0.85) return device;
    return {
      ...device,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    };
  });
  return { devices: currentDevices, updatedAt: new Date().toISOString() };
}

// Kontrak respons GET /api/devices/[id]/metrics — backend menyusul.
export interface DeviceMetricsResponse {
  usage: UsagePoint[];
  temperature: TemperatureReading;
  ports: PortBandwidth[];
  updatedAt: string;
}

export async function fetchDeviceMetrics(
  deviceId: string,
  group: DeviceGroup,
): Promise<DeviceMetricsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return {
    usage: advanceUsageSeries(deviceId),
    temperature: advanceTemperature(deviceId),
    ports: advancePortBandwidth(deviceId, group),
    updatedAt: new Date().toISOString(),
  };
}
