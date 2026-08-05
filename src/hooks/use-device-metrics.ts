"use client";

import useSWR from "swr";
import { DEVICES_REFRESH_INTERVAL_MS } from "@/hooks/use-devices";
import { fetchDeviceMetrics } from "@/lib/api/devices";
import type { DeviceGroup } from "@/types/device";

// Satu key per perangkat — semua panel metrik di halaman detail berbagi
// satu polling 10 detik yang sama lewat cache SWR.
export function useDeviceMetrics(deviceId: string, group: DeviceGroup) {
  const { data, error, isLoading } = useSWR(
    ["device-metrics", deviceId, group],
    ([, id, deviceGroup]) => fetchDeviceMetrics(id, deviceGroup as DeviceGroup),
    {
      refreshInterval: DEVICES_REFRESH_INTERVAL_MS,
      refreshWhenHidden: true,
      revalidateOnFocus: false,
    },
  );

  return {
    usage: data?.usage ?? [],
    temperature: data?.temperature,
    ports: data?.ports ?? [],
    updatedAt: data?.updatedAt,
    error,
    isLoading,
  };
}
