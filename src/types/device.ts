export type DeviceStatus = "online" | "warning" | "offline";

export type DeviceGroup = "MikroTik" | "Ruijie" | "OLT";

export interface NetworkDevice {
  /** Sama dengan `Asset.assetId` (identitas internal Portal). */
  id: string;
  name: string;
  ip: string;
  group: DeviceGroup;
  area: string;
  status: DeviceStatus;
  latitude: number;
  longitude: number;
}
