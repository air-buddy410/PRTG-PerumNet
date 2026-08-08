// Worker pengumpul metrik (Job Scheduler pada arsitektur PRD): menarik
// metrik dari sumber monitoring (saat ini simulasi; LibreNMS pada Fase 3),
// menyimpan sampel mentah ke
// SQLite, dan merangkum rollup per jam ke metric_history.

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  deviceMetadata,
  deviceMetrics,
  metricHistory,
  portMetrics,
} from "@/db/schema";
import { getLatestDevices } from "@/server/device-store";
import { getDeviceMetrics } from "@/server/metrics-store";

const COLLECT_INTERVAL_MS = 60_000;

const HISTORY_CONFLICT_TARGET = [
  metricHistory.assetId,
  metricHistory.metric,
  metricHistory.resolution,
  metricHistory.bucketStart,
];

function hourBucketOf(iso: string): string {
  return `${iso.slice(0, 13)}:00:00.000Z`;
}

function upsertHistory(
  assetId: string,
  metric: "cpu" | "ram" | "suhu" | "bandwidth",
  resolution: "raw" | "hourly",
  bucketStart: string,
  valueAvg: number,
  valueMin: number,
  valueMax: number,
) {
  db.insert(metricHistory)
    .values({
      assetId,
      metric,
      resolution,
      bucketStart,
      valueAvg,
      valueMin,
      valueMax,
    })
    .onConflictDoUpdate({
      target: HISTORY_CONFLICT_TARGET,
      set: { valueAvg, valueMin, valueMax },
    })
    .run();
}

export interface CollectResult {
  devices: number;
  recordedAt: string;
  hourBucket: string;
}

/** Satu siklus pengumpulan: upsert metadata, simpan sampel, rollup per jam. */
export async function collectMetricsOnce(): Promise<CollectResult> {
  const snapshot = await getLatestDevices();
  const recordedAt = new Date().toISOString();
  const hourBucket = hourBucketOf(recordedAt);

  for (const device of snapshot.devices) {
    db.insert(deviceMetadata)
      .values({
        assetId: device.id,
        customName: device.name,
        ipAddress: device.ip,
        deviceGroup: device.group,
        areaName: device.area,
        latitude: device.latitude,
        longitude: device.longitude,
      })
      .onConflictDoUpdate({
        target: deviceMetadata.assetId,
        set: {
          customName: device.name,
          ipAddress: device.ip,
          deviceGroup: device.group,
          areaName: device.area,
          latitude: device.latitude,
          longitude: device.longitude,
        },
      })
      .run();

    const metrics = await getDeviceMetrics(device.id, device.group);
    const latest = metrics.usage[metrics.usage.length - 1];
    const totalBandwidth = metrics.ports.reduce(
      (sum, port) => sum + port.currentDownload,
      0,
    );

    db.insert(deviceMetrics)
      .values({
        assetId: device.id,
        recordedAt,
        cpuPercent: latest.cpu,
        ramPercent: latest.ram,
        temperatureC: metrics.temperature.celsius,
      })
      .onConflictDoNothing()
      .run();

    for (const port of metrics.ports) {
      db.insert(portMetrics)
        .values({
          assetId: device.id,
          portName: port.port,
          recordedAt,
          downloadMbps: port.currentDownload,
          uploadMbps: port.currentUpload,
        })
        .onConflictDoNothing()
        .run();
    }

    // Rollup "raw": satu titik per sampel per metrik.
    const rawValues = {
      cpu: latest.cpu,
      ram: latest.ram,
      suhu: metrics.temperature.celsius,
      bandwidth: totalBandwidth,
    } as const;
    for (const [metric, value] of Object.entries(rawValues)) {
      upsertHistory(
        device.id,
        metric as keyof typeof rawValues,
        "raw",
        recordedAt,
        value,
        value,
        value,
      );
    }

    // Rollup "hourly": agregasi ulang seluruh sampel pada bucket jam berjalan.
    const usageAgg = db
      .select({
        cpuAvg: sql<number>`avg(${deviceMetrics.cpuPercent})`,
        cpuMin: sql<number>`min(${deviceMetrics.cpuPercent})`,
        cpuMax: sql<number>`max(${deviceMetrics.cpuPercent})`,
        ramAvg: sql<number>`avg(${deviceMetrics.ramPercent})`,
        ramMin: sql<number>`min(${deviceMetrics.ramPercent})`,
        ramMax: sql<number>`max(${deviceMetrics.ramPercent})`,
        tempAvg: sql<number>`avg(${deviceMetrics.temperatureC})`,
        tempMin: sql<number>`min(${deviceMetrics.temperatureC})`,
        tempMax: sql<number>`max(${deviceMetrics.temperatureC})`,
      })
      .from(deviceMetrics)
      .where(
        and(
          eq(deviceMetrics.assetId, device.id),
          gte(deviceMetrics.recordedAt, hourBucket),
        ),
      )
      .get();

    if (usageAgg && usageAgg.cpuAvg !== null) {
      upsertHistory(device.id, "cpu", "hourly", hourBucket, usageAgg.cpuAvg, usageAgg.cpuMin, usageAgg.cpuMax);
      upsertHistory(device.id, "ram", "hourly", hourBucket, usageAgg.ramAvg, usageAgg.ramMin, usageAgg.ramMax);
      upsertHistory(device.id, "suhu", "hourly", hourBucket, usageAgg.tempAvg, usageAgg.tempMin, usageAgg.tempMax);
    }

    const bandwidthPerSample = db
      .select({
        total: sql<number>`sum(${portMetrics.downloadMbps})`,
      })
      .from(portMetrics)
      .where(
        and(
          eq(portMetrics.assetId, device.id),
          gte(portMetrics.recordedAt, hourBucket),
        ),
      )
      .groupBy(portMetrics.recordedAt)
      .all();

    if (bandwidthPerSample.length > 0) {
      const totals = bandwidthPerSample.map((row) => row.total);
      upsertHistory(
        device.id,
        "bandwidth",
        "hourly",
        hourBucket,
        totals.reduce((sum, value) => sum + value, 0) / totals.length,
        Math.min(...totals),
        Math.max(...totals),
      );
    }
  }

  return { devices: snapshot.devices.length, recordedAt, hourBucket };
}

// Interval in-process (satu per proses Node, tahan HMR lewat globalThis).
const globalState = globalThis as unknown as {
  __perumnetCollector?: ReturnType<typeof setInterval>;
};

export function startMetricsCollector() {
  if (globalState.__perumnetCollector) return;
  globalState.__perumnetCollector = setInterval(() => {
    collectMetricsOnce().catch((error) => {
      console.error("[collector] gagal mengumpulkan metrik:", error);
    });
  }, COLLECT_INTERVAL_MS);
  console.log(
    `[collector] worker metrik aktif (interval ${COLLECT_INTERVAL_MS / 1000}s)`,
  );
}
