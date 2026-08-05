import { NextResponse } from "next/server";
import { getSlaReport, PERIOD_PATTERN } from "@/server/reports";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports/sla?period=YYYY-MM
 * Laporan ketersediaan SLA bulanan per perangkat (terburuk lebih dulu).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");

  if (!period || !PERIOD_PATTERN.test(period)) {
    return NextResponse.json(
      { error: "period wajib berformat YYYY-MM, mis. 2026-07." },
      { status: 400 },
    );
  }

  return NextResponse.json(getSlaReport(period), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
