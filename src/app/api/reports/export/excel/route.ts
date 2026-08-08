import { NextResponse } from "next/server";
import { buildReportXlsx, recordExport } from "@/server/report-export";
import { PERIOD_PATTERN } from "@/server/reports";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports/export/excel?type=<sla|traffic>&period=YYYY-MM
 * Menghasilkan berkas Excel (.xlsx) laporan dan mencatatnya ke audit
 * sla_reports. Khusus Admin NOC & Manajemen (sesuai persona pelaporan PRD).
 */
export const GET = withRole(["admin", "manajemen"], async (request, user) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "sla";
  const period = searchParams.get("period");

  if (type !== "sla" && type !== "traffic") {
    return NextResponse.json(
      { error: `type wajib "sla" atau "traffic", bukan: ${type}` },
      { status: 400 },
    );
  }
  if (!period || !PERIOD_PATTERN.test(period)) {
    return NextResponse.json(
      { error: "period wajib berformat YYYY-MM, mis. 2026-07." },
      { status: 400 },
    );
  }

  const workbook = await buildReportXlsx(type, period);
  await recordExport(type, "excel", period, user.id);

  return new NextResponse(new Uint8Array(workbook), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-${type}-${period}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
});
