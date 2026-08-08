// Model domain aset PerumNet NOC Portal.
//
// LibreNMS adalah source of truth telemetry (discovery, polling, alert);
// Portal hanya menyimpan metadata aplikasi. `assetId` adalah identitas
// internal Portal, `librenmsDeviceId` adalah relasi ke device di LibreNMS.

/** Peran perangkat dalam jaringan (menentukan ikon/klasifikasi topologi). */
export type NetworkRole =
  | "core"
  | "distribution"
  | "access"
  | "olt"
  | "server"
  | "infrastructure";

export const NETWORK_ROLES: NetworkRole[] = [
  "core",
  "distribution",
  "access",
  "olt",
  "server",
  "infrastructure",
];

/** Status operasional aset yang ditampilkan portal. */
export type AssetStatus = "online" | "warning" | "offline";

/** Referensi opsional ke CRM eksternal (hanya mapping, bukan data CRM). */
export interface CrmReference {
  customerId?: string;
  serviceId?: string;
}

export interface Asset {
  /** Identitas internal Portal. */
  assetId: string;
  /** ID device pada LibreNMS; null bila belum dipetakan. */
  librenmsDeviceId: number | null;
  hostname: string;
  displayName: string;
  managementIp: string;
  /** Vendor/merek dari metadata LibreNMS (`manufacturer`/`os`). */
  vendor: string;
  /** OS perangkat dari LibreNMS (mis. routeros, zxa10). */
  os: string | null;
  /** Hardware/model dari LibreNMS (`hardware`). */
  model: string | null;
  serialNumber: string | null;
  site: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  networkRole: NetworkRole;
  status: AssetStatus;
  crmRef: CrmReference | null;
}
