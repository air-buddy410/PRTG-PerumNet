// Sumber data status perangkat di sisi server.
//
// Meniru arsitektur PRD: worker menyinkronkan data PRTG ke cache tiap 10
// detik, dan endpoint hanya membaca snapshot cache — berapa pun banyaknya
// klien, PRTG tidak ikut terbebani. Untuk saat ini sinkronisasi disimulasikan
// dengan drift status acak; nantinya diganti penarikan PRTG API → Redis.

import { MOCK_DEVICES } from "@/lib/mock-devices";
import { cache } from "@/server/cache";
import type {
  DeviceGroup,
  DeviceStatus,
  NetworkDevice,
} from "@/types/device";

const STATUSES: DeviceStatus[] = ["online", "warning", "offline"];
const SNAPSHOT_CACHE_KEY = "devices:snapshot";
const SNAPSHOT_TTL_SECONDS = 10;

export interface DevicesSnapshot {
  devices: NetworkDevice[];
  updatedAt: string;
}

let devices: NetworkDevice[] = MOCK_DEVICES.map((device) => ({ ...device }));

function syncFromSource() {
  devices = devices.map((device) => {
    if (Math.random() < 0.85) return device;
    return {
      ...device,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    };
  });
}

/**
 * Snapshot status perangkat terbaru, read-through cache ber-TTL 10 detik:
 * selama TTL hidup semua klien mendapat snapshot yang sama tanpa menyentuh
 * sumber; setelah kedaluwarsa, sinkronisasi berikutnya mengisi ulang cache.
 */
export async function getLatestDevices(): Promise<DevicesSnapshot> {
  const cached = await cache.get<DevicesSnapshot>(SNAPSHOT_CACHE_KEY);
  if (cached) return cached;

  syncFromSource();
  const snapshot: DevicesSnapshot = {
    devices,
    updatedAt: new Date().toISOString(),
  };
  await cache.set(SNAPSHOT_CACHE_KEY, snapshot, SNAPSHOT_TTL_SECONDS);
  return snapshot;
}

export interface DeviceMeta {
  areas: string[];
  groups: DeviceGroup[];
}

/** Daftar unik area & jenis perangkat — untuk mengisi kontrol filter peta. */
export function getDeviceMeta(): DeviceMeta {
  return {
    areas: [...new Set(devices.map((device) => device.area))].sort(),
    groups: [...new Set(devices.map((device) => device.group))].sort(),
  };
}
