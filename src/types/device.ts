export type DeviceStatus = "online" | "warning" | "offline";

export type DeviceGroup = "MikroTik" | "Ruijie" | "OLT";

export interface NetworkDevice {
  /** ID referensi perangkat di PRTG */
  id: string;
  name: string;
  ip: string;
  group: DeviceGroup;
  area: string;
  status: DeviceStatus;
  latitude: number;
  longitude: number;
}
