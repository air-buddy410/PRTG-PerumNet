// Layanan data laporan (SLA & trafik) di sisi server.
//
// Rekap bulanan disimpan di tabel sla_monthly / traffic_monthly. Saat sebuah
// periode belum punya rekap, tabel di-seed dari generator tiruan yang sama
// dengan frontend (deterministik per periode+perangkat) — nantinya diganti
// agregasi worker dari data PRTG.

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { deviceMetadata, slaMonthly, trafficMonthly } from "@/db/schema";
import { MOCK_DEVICES } from "@/lib/mock-devices";
import {
  generateSlaReport,
  generateTrafficReport,
  SLA_TARGET_PERCENT,
} from "@/lib/mock-reports";

export const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function ensureDeviceMetadata() {
  for (const device of MOCK_DEVICES) {
    db.insert(deviceMetadata)
      .values({
        prtgDeviceId: device.id,
        customName: device.name,
        ipAddress: device.ip,
        deviceGroup: device.group,
        areaName: device.area,
        latitude: device.latitude,
        longitude: device.longitude,
      })
      .onConflictDoNothing()
      .run();
  }
}

function seedSlaIfMissing(period: string) {
  const existing = db
    .select({ id: slaMonthly.id })
    .from(slaMonthly)
    .where(eq(slaMonthly.period, period))
    .limit(1)
    .get();
  if (existing) return;

  ensureDeviceMetadata();
  for (const row of generateSlaReport(period)) {
    db.insert(slaMonthly)
      .values({
        prtgDeviceId: row.deviceId,
        period,
        uptimePercent: row.uptimePercent,
        downtimeMinutes: row.downtimeMinutes,
        incidents: row.incidents,
      })
      .onConflictDoNothing()
      .run();
  }
}

export function getSlaReport(period: string) {
  seedSlaIfMissing(period);

  const rows = db
    .select({
      deviceId: slaMonthly.prtgDeviceId,
      deviceName: deviceMetadata.customName,
      group: deviceMetadata.deviceGroup,
      area: deviceMetadata.areaName,
      uptimePercent: slaMonthly.uptimePercent,
      downtimeMinutes: slaMonthly.downtimeMinutes,
      incidents: slaMonthly.incidents,
    })
    .from(slaMonthly)
    .innerJoin(
      deviceMetadata,
      eq(slaMonthly.prtgDeviceId, deviceMetadata.prtgDeviceId),
    )
    .where(eq(slaMonthly.period, period))
    .orderBy(asc(slaMonthly.uptimePercent))
    .all();

  const withTarget = rows.map((row) => ({
    ...row,
    meetsTarget: row.uptimePercent >= SLA_TARGET_PERCENT,
  }));
  const averageUptime =
    rows.length === 0
      ? 0
      : Math.round(
          (rows.reduce((sum, row) => sum + row.uptimePercent, 0) /
            rows.length) *
            100,
        ) / 100;

  return {
    period,
    targetPercent: SLA_TARGET_PERCENT,
    rows: withTarget,
    summary: {
      devices: rows.length,
      averageUptime,
      belowTarget: withTarget.filter((row) => !row.meetsTarget).length,
    },
  };
}

function seedTrafficIfMissing(period: string) {
  const existing = db
    .select({ id: trafficMonthly.id })
    .from(trafficMonthly)
    .where(eq(trafficMonthly.period, period))
    .limit(1)
    .get();
  if (existing) return;

  ensureDeviceMetadata();
  for (const row of generateTrafficReport(period)) {
    db.insert(trafficMonthly)
      .values({
        prtgDeviceId: row.deviceId,
        period,
        downloadGb: row.downloadGB,
        uploadGb: row.uploadGB,
        avgMbps: row.avgMbps,
        peakMbps: row.peakMbps,
      })
      .onConflictDoNothing()
      .run();
  }
}

/** Daftar periode "YYYY-MM" inklusif dari `from` sampai `to`. */
export function enumerateMonths(from: string, to: string): string[] {
  const months: string[] = [];
  let [year, month] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  while (year < toYear || (year === toYear && month <= toMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

/**
 * Rekap trafik ter-agregasi untuk rentang bulan [from..to]: total volume
 * dijumlahkan, rata-rata Mbps dirata-ratakan, puncak diambil maksimum.
 */
export function getTrafficReportRange(from: string, to: string) {
  const months = enumerateMonths(from, to);
  const perDevice = new Map<
    string,
    {
      deviceId: string;
      deviceName: string;
      group: string;
      area: string;
      downloadGb: number;
      uploadGb: number;
      avgMbpsSum: number;
      peakMbps: number;
      monthsCounted: number;
    }
  >();

  for (const period of months) {
    for (const row of getTrafficReport(period).rows) {
      const entry = perDevice.get(row.deviceId);
      if (!entry) {
        perDevice.set(row.deviceId, {
          deviceId: row.deviceId,
          deviceName: row.deviceName,
          group: row.group,
          area: row.area,
          downloadGb: row.downloadGb,
          uploadGb: row.uploadGb,
          avgMbpsSum: row.avgMbps,
          peakMbps: row.peakMbps,
          monthsCounted: 1,
        });
      } else {
        entry.downloadGb += row.downloadGb;
        entry.uploadGb += row.uploadGb;
        entry.avgMbpsSum += row.avgMbps;
        entry.peakMbps = Math.max(entry.peakMbps, row.peakMbps);
        entry.monthsCounted += 1;
      }
    }
  }

  const rows = [...perDevice.values()]
    .map(({ avgMbpsSum, monthsCounted, ...rest }) => ({
      ...rest,
      avgMbps: Math.round(avgMbpsSum / monthsCounted),
    }))
    .sort((a, b) => b.downloadGb - a.downloadGb);

  return {
    from,
    to,
    months: months.length,
    rows,
    summary: {
      devices: rows.length,
      totalDownloadGb: rows.reduce((sum, row) => sum + row.downloadGb, 0),
      totalUploadGb: rows.reduce((sum, row) => sum + row.uploadGb, 0),
    },
  };
}

export function getTrafficReport(period: string) {
  seedTrafficIfMissing(period);

  const rows = db
    .select({
      deviceId: trafficMonthly.prtgDeviceId,
      deviceName: deviceMetadata.customName,
      group: deviceMetadata.deviceGroup,
      area: deviceMetadata.areaName,
      downloadGb: trafficMonthly.downloadGb,
      uploadGb: trafficMonthly.uploadGb,
      avgMbps: trafficMonthly.avgMbps,
      peakMbps: trafficMonthly.peakMbps,
    })
    .from(trafficMonthly)
    .innerJoin(
      deviceMetadata,
      eq(trafficMonthly.prtgDeviceId, deviceMetadata.prtgDeviceId),
    )
    .where(eq(trafficMonthly.period, period))
    .all()
    .sort((a, b) => b.downloadGb - a.downloadGb);

  return {
    period,
    rows,
    summary: {
      devices: rows.length,
      totalDownloadGb: rows.reduce((sum, row) => sum + row.downloadGb, 0),
      totalUploadGb: rows.reduce((sum, row) => sum + row.uploadGb, 0),
    },
  };
}
