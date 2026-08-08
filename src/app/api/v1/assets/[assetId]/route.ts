import { NextResponse } from "next/server";
import type { AssetDetailResponse } from "@/server/api-v1/contracts";
import { getAssetsSnapshot } from "@/server/asset-store";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

/** GET /api/v1/assets/:assetId — detail satu aset (perlu login). */
export const GET = withRole<{ params: Promise<{ assetId: string }> }>(
  [],
  async (_request, _user, { params }) => {
    const { assetId } = await params;
    const snapshot = await getAssetsSnapshot();
    const asset = snapshot.assets.find((item) => item.assetId === assetId);
    if (!asset) {
      return NextResponse.json(
        { error: `Aset dengan ID ${assetId} tidak ditemukan.` },
        { status: 404 },
      );
    }
    const body: AssetDetailResponse = {
      asset,
      updatedAt: snapshot.updatedAt,
    };
    return NextResponse.json(body);
  },
);
