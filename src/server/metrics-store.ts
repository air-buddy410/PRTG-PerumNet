// Metrik dasar per perangkat di sisi server, dengan read-through cache
// ber-TTL 10 detik per perangkat — meniru pola worker→cache pada PRD.
// Sumber data disimulasikan (deret maju per sinkronisasi); nantinya diganti
// adapter LibreNMS API (Fase 3).

import {
  advancePortBandwidth,
  advanceTemperature,
  advanceUsageSeries,
  generateOpticalHealth,
  type PonPortHealth,
  type PortBandwidth,
  type TemperatureReading,
  type UsagePoint,
} from "@/lib/mock-metrics";
import { cache } from "@/server/cache";
import type { DeviceGroup } from "@/types/device";

const METRICS_TTL_SECONDS = 10;

export interface DeviceMetricsSnapshot {
  usage: UsagePoint[];
  temperature: TemperatureReading;
  ports: PortBandwidth[];
  updatedAt: string;
}

export async function getDeviceMetrics(
  deviceId: string,
  group: DeviceGroup,
): Promise<DeviceMetricsSnapshot> {
  const key = `device-metrics:${deviceId}`;
  const cached = await cache.get<DeviceMetricsSnapshot>(key);
  if (cached) return cached;

  const snapshot: DeviceMetricsSnapshot = {
    usage: advanceUsageSeries(deviceId),
    temperature: advanceTemperature(deviceId),
    ports: advancePortBandwidth(deviceId, group),
    updatedAt: new Date().toISOString(),
  };
  await cache.set(key, snapshot, METRICS_TTL_SECONDS);
  return snapshot;
}

export interface OltOpticsSnapshot {
  ports: PonPortHealth[];
  updatedAt: string;
}

/** Grid kesehatan optik OLT (SFP PON, Tx/Rx Power, status ONU) ber-cache. */
export async function getOltOptics(deviceId: string): Promise<OltOpticsSnapshot> {
  const key = `olt-optics:${deviceId}`;
  const cached = await cache.get<OltOpticsSnapshot>(key);
  if (cached) return cached;

  const snapshot: OltOpticsSnapshot = {
    ports: generateOpticalHealth(deviceId),
    updatedAt: new Date().toISOString(),
  };
  await cache.set(key, snapshot, METRICS_TTL_SECONDS);
  return snapshot;
}
