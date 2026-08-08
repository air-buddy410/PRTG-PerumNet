import { NextResponse } from "next/server";
import type { AssetsResponse } from "@/server/api-v1/contracts";
import {
  getAssetsSnapshot,
  knownSites,
  knownVendors,
} from "@/server/asset-store";
import { withRole } from "@/server/rbac";
import { NETWORK_ROLES, type NetworkRole } from "@/types/asset";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["online", "warning", "offline"] as const;

/**
 * GET /api/v1/assets?site=&vendor=&role=&status=&q=
 * Daftar aset beserta status terkini (perlu login).
 */
export const GET = withRole([], async (request) => {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site");
  const vendor = searchParams.get("vendor");
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (site && !knownSites().includes(site)) {
    return NextResponse.json(
      { error: `Site tidak dikenal: ${site}` },
      { status: 400 },
    );
  }
  if (vendor && !knownVendors().includes(vendor)) {
    return NextResponse.json(
      { error: `Vendor tidak dikenal: ${vendor}` },
      { status: 400 },
    );
  }
  if (role && !NETWORK_ROLES.includes(role as NetworkRole)) {
    return NextResponse.json(
      { error: `Role jaringan tidak dikenal: ${role}` },
      { status: 400 },
    );
  }
  if (
    status &&
    !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
  ) {
    return NextResponse.json(
      { error: `Status tidak dikenal: ${status}` },
      { status: 400 },
    );
  }

  const snapshot = await getAssetsSnapshot();
  let assets = snapshot.assets;
  if (site) assets = assets.filter((asset) => asset.site === site);
  if (vendor) assets = assets.filter((asset) => asset.vendor === vendor);
  if (role) assets = assets.filter((asset) => asset.networkRole === role);
  if (status) assets = assets.filter((asset) => asset.status === status);
  if (query) {
    assets = assets.filter(
      (asset) =>
        asset.displayName.toLowerCase().includes(query) ||
        asset.hostname.toLowerCase().includes(query) ||
        asset.managementIp.includes(query),
    );
  }

  const body: AssetsResponse = {
    assets,
    total: snapshot.assets.length,
    updatedAt: snapshot.updatedAt,
  };
  return NextResponse.json(body);
});
