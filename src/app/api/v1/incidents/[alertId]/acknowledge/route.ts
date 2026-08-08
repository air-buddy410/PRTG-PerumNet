import { NextResponse } from "next/server";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/incidents/:alertId/acknowledge
 * Contract: body { note?: string } → { incident: IncidentView } (lihat
 * src/server/api-v1/contracts.ts).
 *
 * STUB — implementasi menunggu tabel incident + acknowledgement + audit log
 * pada Fase 2/4. Sengaja mengembalikan 501 agar tidak berpura-pura berhasil.
 */
export const POST = withRole<{ params: Promise<{ alertId: string }> }>(
  ["admin", "noc", "engineer"],
  async (_request, _user, { params }) => {
    const { alertId } = await params;
    return NextResponse.json(
      {
        error:
          "Acknowledge belum tersedia — menunggu model incident (Fase 2).",
        alertId,
      },
      { status: 501 },
    );
  },
);
