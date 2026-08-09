// Test pemetaan murni payload LibreNMS → domain Portal.

import { describe, expect, it } from "vitest";
import {
  availabilityPercent,
  dbmSensorsToOptics,
  enrichAssetFromDevice,
  normalizeActiveAlert,
  normalizeDiscoveredLink,
  octetsRateToMbps,
  portToRate,
  sensorsToTemperature,
  statusFromDevice,
} from "@/server/librenms/normalize";
import type {
  LibrenmsDevice,
  LibrenmsPort,
  LibrenmsSensor,
} from "@/server/librenms/types";
import { FIXTURE_ASSETS } from "@/lib/fixtures/assets";

const sensor = (over: Partial<LibrenmsSensor>): LibrenmsSensor => ({
  sensor_id: 1,
  device_id: 7,
  sensor_class: "temperature",
  sensor_descr: "CPU Temp",
  sensor_current: 40,
  sensor_limit: null,
  sensor_limit_low: null,
  ...over,
});

describe("statusFromDevice", () => {
  it("down → offline", () => {
    expect(statusFromDevice({ status: 0, disabled: 0 }, false)).toBe("offline");
  });
  it("disabled → offline meski status up", () => {
    expect(statusFromDevice({ status: 1, disabled: 1 }, false)).toBe("offline");
  });
  it("up + alert aktif → warning", () => {
    expect(statusFromDevice({ status: 1, disabled: 0 }, true)).toBe("warning");
  });
  it("up bersih → online", () => {
    expect(statusFromDevice({ status: 1, disabled: 0 }, false)).toBe("online");
  });
});

describe("enrichAssetFromDevice", () => {
  const device: LibrenmsDevice = {
    device_id: 7,
    hostname: "olt-tebet-01",
    sysName: "olt-tebet-01",
    display: null,
    ip: "10.2.0.1",
    overwrite_ip: null,
    hardware: "ZXA10 C320",
    os: "zxa10",
    version: "2.1",
    serial: "SN-XYZ",
    status: 1,
    status_reason: null,
    disabled: 0,
    ignore: 0,
    uptime: 1000,
    lat: -6.5,
    lng: 107.1,
    location: "Rack 4",
    purpose: null,
    type: "network",
  };

  it("mengisi hanya kolom yang masih kosong — identitas Portal tetap menang", () => {
    const asset = { ...FIXTURE_ASSETS[0], os: null, serialNumber: null };
    const enriched = enrichAssetFromDevice(asset, device);
    expect(enriched.os).toBe("zxa10");
    expect(enriched.serialNumber).toBe("SN-XYZ");
    // Sudah terisi di Portal → tidak ditimpa LibreNMS.
    expect(enriched.model).toBe(asset.model);
    expect(enriched.latitude).toBe(asset.latitude);
    expect(enriched.displayName).toBe(asset.displayName);
  });
});

describe("octetsRateToMbps & portToRate", () => {
  it("12.500.000 oktet/detik = 100 Mbps", () => {
    expect(octetsRateToMbps(12_500_000)).toBe(100);
  });
  it("null/negatif → 0", () => {
    expect(octetsRateToMbps(null)).toBe(0);
    expect(octetsRateToMbps(-5)).toBe(0);
  });
  it("nama port jatuh ke ifDescr lalu port_id", () => {
    const base: LibrenmsPort = {
      port_id: 9,
      device_id: 1,
      ifName: null,
      ifDescr: null,
      ifAlias: null,
      ifOperStatus: "up",
      ifAdminStatus: "up",
      ifSpeed: null,
      ifInOctets_rate: 1_250_000,
      ifOutOctets_rate: null,
    };
    expect(portToRate({ ...base, ifDescr: "ether1" }).port).toBe("ether1");
    expect(portToRate(base).port).toBe("port-9");
    expect(portToRate(base).downloadMbps).toBe(10);
    expect(portToRate(base).uploadMbps).toBe(0);
  });
});

describe("sensorsToTemperature", () => {
  it("mengambil suhu terpanas dari kelas temperature", () => {
    const reading = sensorsToTemperature([
      sensor({ sensor_current: 42 }),
      sensor({ sensor_current: 55.6, sensor_descr: "Board" }),
      sensor({ sensor_class: "voltage", sensor_current: 230 }),
    ]);
    expect(reading).toEqual({ celsius: 56, status: "normal" });
  });
  it("ambang: ≥60 tinggi, ≥75 kritis", () => {
    expect(sensorsToTemperature([sensor({ sensor_current: 61 })])?.status).toBe(
      "tinggi",
    );
    expect(sensorsToTemperature([sensor({ sensor_current: 80 })])?.status).toBe(
      "kritis",
    );
  });
  it("null bila tidak ada sensor suhu", () => {
    expect(sensorsToTemperature([sensor({ sensor_class: "dbm" })])).toBeNull();
  });
});

describe("dbmSensorsToOptics", () => {
  it("memetakan sensor dbm menjadi port optik (tanpa daftar ONU)", () => {
    const ports = dbmSensorsToOptics([
      sensor({ sensor_class: "dbm", sensor_descr: "gpon 1/1 Tx", sensor_current: 2.34 }),
      sensor({ sensor_class: "dbm", sensor_descr: "gpon 1/2 Tx", sensor_current: null }),
      sensor({ sensor_class: "temperature" }),
    ]);
    expect(ports).toHaveLength(2);
    expect(ports[0]).toEqual({
      port: "gpon 1/1 Tx",
      sfpUp: true,
      txPower: 2.3,
      onus: [],
    });
    expect(ports[1].sfpUp).toBe(false);
  });
});

describe("availabilityPercent", () => {
  const rows = [
    { duration: 86400, availability_perc: "99.987654" },
    { duration: 604800, availability_perc: 100 },
  ];
  it("membaca persentase (string LibreNMS di-parse)", () => {
    expect(availabilityPercent(rows, 86400)).toBeCloseTo(99.987654);
    expect(availabilityPercent(rows, 604800)).toBe(100);
  });
  it("null bila jendela tidak tersedia", () => {
    expect(availabilityPercent(rows, 2592000)).toBeNull();
  });
});

describe("normalizeActiveAlert", () => {
  const row = {
    id: 42,
    device_id: 7,
    rule_id: 3,
    state: 1,
    severity: "critical" as const,
    alerted: 1,
    timestamp: "2026-08-09 10:00:00",
  };
  it("alert aktif dipertahankan; state 2 = acknowledged", () => {
    expect(normalizeActiveAlert(row)).toMatchObject({
      alertId: "42",
      librenmsDeviceId: 7,
      severity: "critical",
      acknowledged: false,
    });
    expect(normalizeActiveAlert({ ...row, state: 2 })?.acknowledged).toBe(true);
  });
  it("state 0 (cleared) & severity ok dibuang", () => {
    expect(normalizeActiveAlert({ ...row, state: 0 })).toBeNull();
    expect(normalizeActiveAlert({ ...row, severity: "ok" })).toBeNull();
  });
});

describe("normalizeDiscoveredLink", () => {
  const link = {
    id: 1,
    local_device_id: 3,
    remote_device_id: 9,
    active: 1,
    protocol: "LLDP",
    local_port_id: 12,
    remote_port: "Gi0/1",
    remote_hostname: "agg-sunter-01",
    remote_platform: null,
  };
  it("link aktif ternormalisasi; protokol huruf kecil", () => {
    expect(normalizeDiscoveredLink(link)).toEqual({
      localDeviceId: 3,
      remoteDeviceId: 9,
      protocol: "lldp",
      localPortId: 12,
      remotePort: "Gi0/1",
      remoteHostname: "agg-sunter-01",
    });
  });
  it("link non-aktif atau remote tak dikenal dibuang", () => {
    expect(normalizeDiscoveredLink({ ...link, active: 0 })).toBeNull();
    expect(normalizeDiscoveredLink({ ...link, remote_device_id: null })).toBeNull();
    expect(normalizeDiscoveredLink({ ...link, remote_device_id: 0 })).toBeNull();
  });
});
