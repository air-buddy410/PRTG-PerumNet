// Pustaka transformasi murni untuk migrasi data SQLite → PostgreSQL.
// Dipisah dari skrip utama agar dapat diuji unit (tests/migrate-lib.test.ts).

/** Tabel era SQLite yang SENGAJA tidak dimigrasikan. */
export const SKIPPED_TABLES = [
  // Telemetry mock — LibreNMS menjadi source of truth telemetry.
  "device_metrics",
  "port_metrics",
  "pon_port_samples",
  "onu_status_samples",
  "metric_history",
  // Cache laporan turunan dari generator mock — diisi ulang, bukan dibawa.
  "sla_monthly",
  "traffic_monthly",
];

/** Epoch milidetik (auth SQLite) → Date; null-safe. */
export function msToDate(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Date(n);
}

/** Teks timestamp SQLite → Date. Mendukung ISO 8601 dan "YYYY-MM-DD HH:MM:SS" (UTC). */
export function textTsToDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  // Format datetime('now') SQLite tidak punya zona → perlakukan sebagai UTC.
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)
    ? `${text.replace(" ", "T")}Z`
    : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function intToBool(value) {
  return value === 1 || value === true;
}

/** Grup legacy device_metadata → vendor + network role aset. */
export function mapLegacyGroup(deviceGroup) {
  if (deviceGroup === "OLT") return { vendor: "ZTE", networkRole: "olt" };
  if (deviceGroup === "MikroTik")
    // Peran granular (core/distribution) tidak tercatat pada skema lama;
    // operator meninjau ulang setelah migrasi (lihat docs/DB_MIGRATION.md).
    return { vendor: "MikroTik", networkRole: "access" };
  return { vendor: deviceGroup ?? "Unknown", networkRole: "access" };
}

export function slugifyHostname(name) {
  return (
    String(name ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 63) || "asset"
  );
}

/** Baris device_metadata (SQLite) → baris assets (PostgreSQL). */
export function mapDeviceMetadataToAsset(row) {
  const { vendor, networkRole } = mapLegacyGroup(row.device_group);
  return {
    asset_id: row.prtg_device_id,
    librenms_device_id: null, // belum dipetakan ke LibreNMS
    hostname: slugifyHostname(row.custom_name),
    display_name: row.custom_name,
    management_ip: row.ip_address,
    vendor,
    os: null,
    model: null,
    serial_number: null,
    site: row.area_name,
    location: null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    tags: [],
    network_role: networkRole,
    created_at: textTsToDate(row.created_at) ?? new Date(),
  };
}

/** Baris notification_logs (SQLite) → baris PostgreSQL (rename kolom alert). */
export function mapNotificationLog(row) {
  return {
    id: row.id,
    librenms_alert_id: row.prtg_sensor_id,
    device_name: row.device_name,
    alert_type: row.alert_type,
    message_content: row.message_content,
    status: row.status,
    resolution_note: row.resolution_note ?? null,
    triggered_at: textTsToDate(row.triggered_at) ?? new Date(),
  };
}
