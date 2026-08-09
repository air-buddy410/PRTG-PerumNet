// Sumber data aset Portal — delegasi ke snapshot terpusat device-store
// (mode terhubung: tabel assets + status LibreNMS; mode fixture: berlabel).

import { assetToLegacyDevice } from "@/lib/fixtures/assets";
import {
  getAssetsWithStatus,
  type AssetsStatusSnapshot,
} from "@/server/device-store";

export type AssetsSnapshot = AssetsStatusSnapshot;

export function getAssetsSnapshot(): Promise<AssetsSnapshot> {
  return getAssetsWithStatus();
}

/** Vendor yang dikenal — untuk memvalidasi parameter filter. */
export async function knownVendors(): Promise<string[]> {
  const { assets } = await getAssetsWithStatus();
  return [...new Set(assets.map((asset) => asset.vendor))].sort();
}

export async function knownSites(): Promise<string[]> {
  const { assets } = await getAssetsWithStatus();
  return [...new Set(assets.map((asset) => asset.site))].sort();
}

export { assetToLegacyDevice };
