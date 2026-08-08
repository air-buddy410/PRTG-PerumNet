import { NextResponse } from "next/server";
import type { OverviewResponse } from "@/server/api-v1/contracts";
import { getAssetsSnapshot } from "@/server/asset-store";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

/** GET /api/v1/overview — ringkasan kesehatan untuk dasbor (perlu login). */
export const GET = withRole([], async () => {
  const { assets, updatedAt } = await getAssetsSnapshot();

  const totals = assets.reduce(
    (acc, asset) => {
      acc[asset.status] += 1;
      return acc;
    },
    { online: 0, warning: 0, offline: 0 },
  );

  const body: OverviewResponse = {
    totals: { total: assets.length, ...totals },
    updatedAt,
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
});
