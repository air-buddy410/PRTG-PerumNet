// Uji transformasi murni migrasi data SQLite → PostgreSQL.

import { describe, expect, it } from "vitest";
import {
  intToBool,
  mapDeviceMetadataToAsset,
  mapLegacyGroup,
  mapNotificationLog,
  msToDate,
  slugifyHostname,
  SKIPPED_TABLES,
  textTsToDate,
} from "../scripts/migrate-lib.mjs";

describe("konversi waktu", () => {
  it("epoch ms → Date", () => {
    expect(msToDate(1754400000000)?.toISOString()).toBe(
      "2025-08-05T13:20:00.000Z",
    );
    expect(msToDate(null)).toBeNull();
    expect(msToDate("bukan-angka")).toBeNull();
  });

  it("teks datetime SQLite (tanpa zona) diperlakukan sebagai UTC", () => {
    expect(textTsToDate("2026-08-05 12:34:56")?.toISOString()).toBe(
      "2026-08-05T12:34:56.000Z",
    );
  });

  it("teks ISO ber-offset dipertahankan", () => {
    expect(textTsToDate("2026-08-05T13:58:21+07:00")?.toISOString()).toBe(
      "2026-08-05T06:58:21.000Z",
    );
    expect(textTsToDate(null)).toBeNull();
    expect(textTsToDate("acak")).toBeNull();
  });
});

describe("mapping aset", () => {
  it("grup OLT → vendor ZTE + role olt", () => {
    expect(mapLegacyGroup("OLT")).toEqual({ vendor: "ZTE", networkRole: "olt" });
    expect(mapLegacyGroup("MikroTik").vendor).toBe("MikroTik");
    expect(mapLegacyGroup("Ruijie").networkRole).toBe("access");
  });

  it("device_metadata → assets: identitas & koordinat terbawa, librenms null", () => {
    const asset = mapDeviceMetadataToAsset({
      prtg_device_id: "2203",
      custom_name: "OLT ZTE C320 - Area Kebayoran",
      ip_address: "10.2.0.3",
      device_group: "OLT",
      area_name: "Jakarta Selatan",
      latitude: -6.2437,
      longitude: 106.7826,
      created_at: "2026-08-05 12:00:00",
    });
    expect(asset.asset_id).toBe("2203");
    expect(asset.librenms_device_id).toBeNull();
    expect(asset.vendor).toBe("ZTE");
    expect(asset.network_role).toBe("olt");
    expect(asset.hostname).toBe("olt-zte-c320-area-kebayoran");
    expect(asset.latitude).toBe(-6.2437);
  });

  it("slug hostname aman", () => {
    expect(slugifyHostname("Router (Core) #1!")).toBe("router-core-1");
    expect(slugifyHostname("")).toBe("asset");
  });
});

describe("mapping log & aturan skip", () => {
  it("prtg_sensor_id → librenms_alert_id", () => {
    const log = mapNotificationLog({
      id: "log-01",
      prtg_sensor_id: "13245",
      device_name: "OLT",
      alert_type: "telegram",
      message_content: "🔴 DOWN",
      status: "sent",
      resolution_note: null,
      triggered_at: "2026-08-05T13:58:21+07:00",
    });
    expect(log.librenms_alert_id).toBe("13245");
    expect(log.triggered_at?.toISOString()).toBe("2026-08-05T06:58:21.000Z");
  });

  it("intToBool", () => {
    expect(intToBool(1)).toBe(true);
    expect(intToBool(0)).toBe(false);
  });

  it("seluruh tabel telemetry & cache mock masuk daftar skip", () => {
    for (const table of [
      "device_metrics",
      "port_metrics",
      "pon_port_samples",
      "onu_status_samples",
      "metric_history",
      "sla_monthly",
      "traffic_monthly",
    ]) {
      expect(SKIPPED_TABLES).toContain(table);
    }
  });
});
