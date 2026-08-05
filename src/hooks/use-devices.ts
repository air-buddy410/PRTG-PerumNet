"use client";

import useSWR from "swr";
import { fetchDevices } from "@/lib/api/devices";

export const DEVICES_REFRESH_INTERVAL_MS = 10_000;

// Satu key bersama — semua komponen yang memakai hook ini membaca cache SWR
// yang sama, jadi hanya ada satu polling 10 detik untuk seluruh halaman.
export function useDevices() {
  const { data, error, isLoading } = useSWR("devices", fetchDevices, {
    refreshInterval: DEVICES_REFRESH_INTERVAL_MS,
    // Wallboard NOC dibiarkan terbuka 24/7 — tetap poll walau tab tidak fokus
    refreshWhenHidden: true,
    revalidateOnFocus: false,
  });

  return {
    devices: data?.devices ?? [],
    updatedAt: data?.updatedAt,
    error,
    isLoading,
  };
}
