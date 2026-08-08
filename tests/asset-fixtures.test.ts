import { describe, expect, it } from "vitest";
import { assetToLegacyDevice, FIXTURE_ASSETS } from "@/lib/fixtures/assets";
import { NETWORK_ROLES } from "@/types/asset";

describe("FIXTURE_ASSETS (development fixture)", () => {
  it("assetId unik", () => {
    const ids = FIXTURE_ASSETS.map((asset) => asset.assetId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("librenmsDeviceId unik dan positif", () => {
    const ids = FIXTURE_ASSETS.map((asset) => asset.librenmsDeviceId);
    expect(ids.every((id) => id !== null && id > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("networkRole selalu salah satu dari enum yang valid", () => {
    for (const asset of FIXTURE_ASSETS) {
      expect(NETWORK_ROLES).toContain(asset.networkRole);
    }
  });

  it("aset ber-role olt selalu vendor ZTE (topologi ISP saat ini)", () => {
    for (const asset of FIXTURE_ASSETS) {
      if (asset.networkRole === "olt") expect(asset.vendor).toBe("ZTE");
    }
  });

  it("koordinat berada di sekitar Jabodetabek", () => {
    for (const asset of FIXTURE_ASSETS) {
      expect(asset.latitude).toBeGreaterThan(-7);
      expect(asset.latitude).toBeLessThan(-6);
      expect(asset.longitude).toBeGreaterThan(106);
      expect(asset.longitude).toBeLessThan(108);
    }
  });

  it("metadata vendor/OS/model terisi (kebutuhan klasifikasi topologi)", () => {
    for (const asset of FIXTURE_ASSETS) {
      expect(asset.vendor).not.toBe("");
      expect(asset.os).toBeTruthy();
      expect(asset.model).toBeTruthy();
      expect(asset.hostname).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("assetToLegacyDevice", () => {
  it("memetakan field inti tanpa kehilangan informasi", () => {
    const asset = FIXTURE_ASSETS[0];
    const device = assetToLegacyDevice(asset);
    expect(device.id).toBe(asset.assetId);
    expect(device.name).toBe(asset.displayName);
    expect(device.ip).toBe(asset.managementIp);
    expect(device.area).toBe(asset.site);
    expect(device.status).toBe(asset.status);
  });

  it("role olt → grup legacy OLT; vendor menentukan sisanya", () => {
    const groups = FIXTURE_ASSETS.map((asset) => ({
      role: asset.networkRole,
      vendor: asset.vendor,
      group: assetToLegacyDevice(asset).group,
    }));
    for (const { role, vendor, group } of groups) {
      if (role === "olt") expect(group).toBe("OLT");
      else if (vendor === "MikroTik") expect(group).toBe("MikroTik");
      else expect(group).toBe("Ruijie");
    }
  });
});
