import { NextResponse } from "next/server";
import { listLogs, type LogFilters } from "@/server/notification-logs";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 200;

/**
 * GET /api/notifications/logs
 *   ?q=&channel=<telegram|whatsapp>&status=<sent|failed>&limit=&offset=
 * Riwayat alert (terbaru dulu), disaring di SQL, dengan paginasi.
 * `total` = jumlah baris cocok filter tanpa paginasi.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const status = searchParams.get("status");
  const limitRaw = searchParams.get("limit") ?? "50";
  const offsetRaw = searchParams.get("offset") ?? "0";
  const limit = Number(limitRaw);
  const offset = Number(offsetRaw);

  if (channel && !["telegram", "whatsapp"].includes(channel)) {
    return NextResponse.json(
      { error: `Channel tidak dikenal: ${channel}` },
      { status: 400 },
    );
  }
  if (status && !["sent", "failed"].includes(status)) {
    return NextResponse.json(
      { error: `Status tidak dikenal: ${status}` },
      { status: 400 },
    );
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return NextResponse.json(
      { error: `limit tidak valid: ${limitRaw} (1–${MAX_LIMIT})` },
      { status: 400 },
    );
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json(
      { error: `offset tidak valid: ${offsetRaw}` },
      { status: 400 },
    );
  }

  const page = listLogs({
    q: searchParams.get("q") ?? undefined,
    channel: (channel ?? undefined) as LogFilters["channel"],
    status: (status ?? undefined) as LogFilters["status"],
    limit,
    offset,
  });

  return NextResponse.json(page);
}
