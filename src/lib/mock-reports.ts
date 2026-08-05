// Generator laporan tiruan — deterministik per (periode, perangkat) sehingga
// pergantian periode menghasilkan angka berbeda namun stabil antar-render.

import { MOCK_DEVICES } from "@/lib/mock-devices";
import type { DeviceGroup } from "@/types/device";

export const SLA_TARGET_PERCENT = 99.5;

export interface SlaReportRow {
  deviceId: string;
  deviceName: string;
  group: DeviceGroup;
  area: string;
  uptimePercent: number;
  downtimeMinutes: number;
  incidents: number;
  meetsTarget: boolean;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  }
  return hash;
}

const MINUTES_PER_MONTH = 30 * 24 * 60;

/** Laporan ketersediaan SLA per perangkat untuk satu periode (mis. "2026-07"). */
export function generateSlaReport(period: string): SlaReportRow[] {
  return MOCK_DEVICES.map((device) => {
    const rand = mulberry32(hashSeed(`sla:${period}:${device.id}`));
    // Mayoritas perangkat sehat; sebagian kecil jatuh di bawah target.
    const roll = rand();
    const uptimePercent =
      roll < 0.75
        ? 99.5 + rand() * 0.49
        : roll < 0.92
          ? 98.5 + rand() * 1.0
          : 96.5 + rand() * 2.0;
    const rounded = Math.round(uptimePercent * 100) / 100;
    const downtimeMinutes = Math.round(
      ((100 - rounded) / 100) * MINUTES_PER_MONTH,
    );
    const incidents =
      rounded >= 99.9 ? Math.round(rand()) : 1 + Math.floor(rand() * 5);
    return {
      deviceId: device.id,
      deviceName: device.name,
      group: device.group,
      area: device.area,
      uptimePercent: rounded,
      downtimeMinutes,
      incidents,
      meetsTarget: rounded >= SLA_TARGET_PERCENT,
    };
  }).sort((a, b) => a.uptimePercent - b.uptimePercent);
}

export interface TrafficReportRow {
  deviceId: string;
  deviceName: string;
  group: DeviceGroup;
  area: string;
  downloadGB: number;
  uploadGB: number;
  avgMbps: number;
  peakMbps: number;
}

/** Rekap penggunaan trafik per perangkat untuk satu periode. */
export function generateTrafficReport(period: string): TrafficReportRow[] {
  return MOCK_DEVICES.map((device) => {
    const rand = mulberry32(hashSeed(`traffic:${period}:${device.id}`));
    // OLT membawa trafik pelanggan — volumenya paling besar.
    const scale = device.group === "OLT" ? 3 : device.group === "Ruijie" ? 1.5 : 1;
    const downloadGB = Math.round((800 + rand() * 9000) * scale);
    const uploadGB = Math.round(downloadGB * (0.15 + rand() * 0.2));
    const avgMbps = Math.round((downloadGB * 8 * 1000) / MINUTES_PER_MONTH / 60);
    const peakMbps = Math.round(avgMbps * (2.5 + rand() * 2));
    return {
      deviceId: device.id,
      deviceName: device.name,
      group: device.group,
      area: device.area,
      downloadGB,
      uploadGB,
      avgMbps,
      peakMbps,
    };
  }).sort((a, b) => b.downloadGB - a.downloadGB);
}

export function formatVolume(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
  return `${gb} GB`;
}

export function formatDowntime(minutes: number): string {
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} mnt`;
}
