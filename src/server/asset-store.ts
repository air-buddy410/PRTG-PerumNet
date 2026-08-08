// Sumber data aset Portal: metadata dari fixture development (Fase 3: dari
// LibreNMS + tabel assets), status live dari snapshot device-store ber-cache.

import { assetToLegacyDevice, FIXTURE_ASSETS } from "@/lib/fixtures/assets";
import { getLatestDevices } from "@/server/device-store";
import type { Asset } from "@/types/asset";

export interface AssetsSnapshot {
  assets: Asset[];
  updatedAt: string;
}

export async function getAssetsSnapshot(): Promise<AssetsSnapshot> {
  const { devices, updatedAt } = await getLatestDevices();
  const statusByAssetId = new Map(
    devices.map((device) => [device.id, device.status]),
  );
  return {
    assets: FIXTURE_ASSETS.map((asset) => ({
      ...asset,
      status: statusByAssetId.get(asset.assetId) ?? asset.status,
    })),
    updatedAt,
  };
}

/** Vendor legacy → dipakai untuk memvalidasi filter. */
export function knownVendors(): string[] {
  return [...new Set(FIXTURE_ASSETS.map((asset) => asset.vendor))].sort();
}

export function knownSites(): string[] {
  return [...new Set(FIXTURE_ASSETS.map((asset) => asset.site))].sort();
}

export { assetToLegacyDevice };
