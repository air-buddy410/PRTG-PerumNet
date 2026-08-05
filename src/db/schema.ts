// Skema database aplikasi (SQLite + Drizzle) — mengikuti PRD §6.
// Riwayat metrik panjang tetap tanggung jawab PRTG; tabel metrik di sini
// menyimpan sampel terbaru untuk kebutuhan tampilan cepat & offline PRTG.

import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Profil perangkat khusus aplikasi: mengawinkan ID perangkat PRTG dengan
// koordinat peta GIS & pengelompokan area (PRTG tidak menyimpan lat/lng).
export const deviceMetadata = sqliteTable("device_metadata", {
  prtgDeviceId: text("prtg_device_id").primaryKey(),
  customName: text("custom_name").notNull(),
  ipAddress: text("ip_address").notNull(),
  deviceGroup: text("device_group", {
    enum: ["MikroTik", "Ruijie", "OLT"],
  }).notNull(),
  areaName: text("area_name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Sampel metrik dasar per perangkat (CPU, RAM, suhu) per titik waktu.
export const deviceMetrics = sqliteTable(
  "device_metrics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    recordedAt: text("recorded_at").notNull(),
    cpuPercent: real("cpu_percent").notNull(),
    ramPercent: real("ram_percent").notNull(),
    temperatureC: real("temperature_c").notNull(),
  },
  (table) => [
    uniqueIndex("device_metrics_device_time_idx").on(
      table.prtgDeviceId,
      table.recordedAt,
    ),
  ],
);

// Rekap ketersediaan SLA bulanan per perangkat (bahan klaim ganti rugi SLA).
export const slaMonthly = sqliteTable(
  "sla_monthly",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    /** Periode laporan, format "YYYY-MM". */
    period: text("period").notNull(),
    uptimePercent: real("uptime_percent").notNull(),
    downtimeMinutes: integer("downtime_minutes").notNull(),
    incidents: integer("incidents").notNull(),
  },
  (table) => [
    uniqueIndex("sla_monthly_device_period_idx").on(
      table.prtgDeviceId,
      table.period,
    ),
  ],
);

// Rekap penggunaan trafik bulanan per perangkat.
export const trafficMonthly = sqliteTable(
  "traffic_monthly",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    /** Periode laporan, format "YYYY-MM". */
    period: text("period").notNull(),
    downloadGb: real("download_gb").notNull(),
    uploadGb: real("upload_gb").notNull(),
    avgMbps: real("avg_mbps").notNull(),
    peakMbps: real("peak_mbps").notNull(),
  },
  (table) => [
    uniqueIndex("traffic_monthly_device_period_idx").on(
      table.prtgDeviceId,
      table.period,
    ),
  ],
);

// Audit riwayat ekspor laporan (tabel sla_reports pada PRD).
// user_id menyusul ber-FK setelah tabel autentikasi (Better Auth) dibuat.
export const slaReports = sqliteTable("sla_reports", {
  id: text("id").primaryKey(),
  reportName: text("report_name").notNull(),
  reportType: text("report_type", { enum: ["sla", "traffic"] }).notNull(),
  formatType: text("format_type", { enum: ["pdf", "excel"] }).notNull(),
  period: text("period").notNull(),
  userId: text("user_id"),
  generatedAt: text("generated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Channel notifikasi terdaftar (bot WhatsApp/Telegram) beserta status
// verifikasi kode dan keaktifan menerima alert.
export const notificationChannels = sqliteTable("notification_channels", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["telegram", "whatsapp"] }).notNull(),
  recipientName: text("recipient_name").notNull(),
  /** Username/ID Telegram atau nomor WhatsApp tujuan. */
  target: text("target").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  /** Kode verifikasi yang harus dikirim ke bot; null setelah terverifikasi. */
  verificationCode: text("verification_code"),
  /** ID chat akun WA/Telegram yang tertaut setelah kode diverifikasi bot. */
  chatId: text("chat_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Audit log alert yang diteruskan sistem ke bot (skema notification_logs PRD).
export const notificationLogs = sqliteTable("notification_logs", {
  id: text("id").primaryKey(),
  prtgSensorId: text("prtg_sensor_id").notNull(),
  deviceName: text("device_name").notNull(),
  alertType: text("alert_type", { enum: ["telegram", "whatsapp"] }).notNull(),
  messageContent: text("message_content").notNull(),
  status: text("status", { enum: ["sent", "failed"] }).notNull(),
  /** Catatan solusi/tindak lanjut yang diisi tim NOC. */
  resolutionNote: text("resolution_note"),
  triggeredAt: text("triggered_at").notNull(),
});

// Time-series historis metrik ter-agregasi per bucket waktu. Sampel mentah
// (10 detik) dirangkum worker menjadi bucket raw/hourly/daily agar grafik
// riwayat rentang panjang (24 jam / 7 hari) tetap ringan di-query.
export const metricHistory = sqliteTable(
  "metric_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    metric: text("metric", {
      enum: ["cpu", "ram", "suhu", "bandwidth"],
    }).notNull(),
    resolution: text("resolution", {
      enum: ["raw", "hourly", "daily"],
    }).notNull(),
    /** Awal bucket (ISO 8601); lebar bucket ditentukan oleh resolution. */
    bucketStart: text("bucket_start").notNull(),
    valueAvg: real("value_avg").notNull(),
    valueMin: real("value_min").notNull(),
    valueMax: real("value_max").notNull(),
  },
  (table) => [
    uniqueIndex("metric_history_device_metric_res_bucket_idx").on(
      table.prtgDeviceId,
      table.metric,
      table.resolution,
      table.bucketStart,
    ),
  ],
);

// Sampel status SFP port PON pada OLT (up/down + daya pancar) per titik waktu.
export const ponPortSamples = sqliteTable(
  "pon_port_samples",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    portName: text("port_name").notNull(),
    sfpUp: integer("sfp_up", { mode: "boolean" }).notNull(),
    txPowerDbm: real("tx_power_dbm").notNull(),
    recordedAt: text("recorded_at").notNull(),
  },
  (table) => [
    uniqueIndex("pon_port_samples_device_port_time_idx").on(
      table.prtgDeviceId,
      table.portName,
      table.recordedAt,
    ),
  ],
);

// Sampel status ONU pelanggan per port PON: daya terima (Rx Power) dan
// keadaan Online/Offline/Dying Gasp per titik waktu.
export const onuStatusSamples = sqliteTable(
  "onu_status_samples",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    portName: text("port_name").notNull(),
    onuId: text("onu_id").notNull(),
    rxPowerDbm: real("rx_power_dbm").notNull(),
    status: text("status", {
      enum: ["online", "offline", "dying_gasp"],
    }).notNull(),
    recordedAt: text("recorded_at").notNull(),
  },
  (table) => [
    uniqueIndex("onu_status_samples_device_port_onu_time_idx").on(
      table.prtgDeviceId,
      table.portName,
      table.onuId,
      table.recordedAt,
    ),
  ],
);

// Sampel trafik per port (download/upload Mbps) per titik waktu.
export const portMetrics = sqliteTable(
  "port_metrics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prtgDeviceId: text("prtg_device_id")
      .notNull()
      .references(() => deviceMetadata.prtgDeviceId, { onDelete: "cascade" }),
    portName: text("port_name").notNull(),
    recordedAt: text("recorded_at").notNull(),
    downloadMbps: real("download_mbps").notNull(),
    uploadMbps: real("upload_mbps").notNull(),
  },
  (table) => [
    uniqueIndex("port_metrics_device_port_time_idx").on(
      table.prtgDeviceId,
      table.portName,
      table.recordedAt,
    ),
  ],
);
