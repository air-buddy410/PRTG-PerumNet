// Bentuk payload mentah LibreNMS API v0 (subset kolom yang dipakai Portal).
// Referensi: https://docs.librenms.org/API/

export interface LibrenmsDevice {
  device_id: number;
  hostname: string;
  sysName: string | null;
  display: string | null;
  ip: string | null;
  overwrite_ip: string | null;
  hardware: string | null;
  os: string | null;
  version: string | null;
  serial: string | null;
  /** 1 = up, 0 = down. */
  status: 0 | 1;
  status_reason: string | null;
  disabled: 0 | 1;
  ignore: 0 | 1;
  uptime: number | null;
  lat: number | null;
  lng: number | null;
  location: string | null;
  purpose: string | null;
  type: string | null;
}

export interface LibrenmsPort {
  port_id: number;
  device_id: number;
  ifName: string | null;
  ifDescr: string | null;
  ifAlias: string | null;
  ifOperStatus: "up" | "down" | "testing" | null;
  ifAdminStatus: "up" | "down" | null;
  ifSpeed: number | null;
  /** Rate oktet per detik (bukan bit). */
  ifInOctets_rate: number | null;
  ifOutOctets_rate: number | null;
}

export interface LibrenmsSensor {
  sensor_id: number;
  device_id: number;
  /** Kelas sensor: processor tidak di sini; umum: temperature, dbm, voltage… */
  sensor_class: string;
  sensor_descr: string;
  sensor_current: number | null;
  sensor_limit: number | null;
  sensor_limit_low: number | null;
}

export interface LibrenmsProcessor {
  processor_id: number;
  device_id: number;
  processor_descr: string | null;
  processor_usage: number | null;
}

export interface LibrenmsMempool {
  mempool_id: number;
  device_id: number;
  mempool_descr: string | null;
  mempool_perc: number | null;
}

export interface LibrenmsAlertRow {
  id: number;
  device_id: number;
  rule_id: number;
  /** 1 = active, 0 = cleared, 2 = acknowledged. */
  state: number;
  severity: "ok" | "warning" | "critical";
  alerted: number;
  timestamp: string;
  hostname?: string;
  note?: string | null;
}

export interface LibrenmsAvailability {
  /** Durasi jendela dalam detik (86400, 604800, 2592000, 31536000). */
  duration: number;
  availability_perc: number | string;
}

export interface LibrenmsEventlogRow {
  event_id: number;
  device_id: number;
  datetime: string;
  message: string;
  type: string;
  severity: number;
}

export interface LibrenmsLink {
  id: number;
  local_device_id: number;
  remote_device_id: number | null;
  active: number;
  protocol: string | null;
  local_port_id: number | null;
  remote_port: string | null;
  remote_hostname: string | null;
  remote_platform: string | null;
}
