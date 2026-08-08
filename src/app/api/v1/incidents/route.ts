import { NextResponse } from "next/server";
import type {
  IncidentsResponse,
  IncidentView,
} from "@/server/api-v1/contracts";
import type { AlertSeverity } from "@/server/librenms/alert";
import { listLogs } from "@/server/notification-logs";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

// INTERIM (sampai tabel incident tersedia di Fase 2): daftar incident
// dipetakan dari log notifikasi. Konsekuensinya: state selalu "open",
// acknowledgement belum tersedia, dan severity diinferensikan dari isi pesan.
function inferSeverity(message: string): AlertSeverity {
  if (message.includes("🔴") || /\bDOWN\b/i.test(message)) return "critical";
  if (message.includes("🟡") || /\bWARNING\b/i.test(message)) return "warning";
  return "ok";
}

/** GET /api/v1/incidents — daftar incident, terbaru lebih dulu (perlu login). */
export const GET = withRole([], async (request) => {
  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit") ?? "100";
  const limit = Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    return NextResponse.json(
      { error: `limit tidak valid: ${limitRaw} (1–200)` },
      { status: 400 },
    );
  }

  const page = await listLogs({ limit });
  const incidents: IncidentView[] = page.logs.map((log) => ({
    id: log.id,
    librenmsAlertId: log.librenmsAlertId,
    assetId: null,
    deviceName: log.deviceName,
    severity: inferSeverity(log.messageContent),
    state: "open",
    message: log.messageContent,
    triggeredAt: log.triggeredAt.toISOString(),
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolutionNote: log.resolutionNote,
  }));

  const body: IncidentsResponse = { incidents, total: page.total };
  return NextResponse.json(body);
});
