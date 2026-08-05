import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notificationLogs } from "@/db/schema";
import { getLogById } from "@/server/notification-logs";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

type LogRouteContext = { params: Promise<{ id: string }> };

/** GET /api/notifications/logs/:id — detail satu entri riwayat notifikasi. */
export const GET = withRole<LogRouteContext>([], async (
  _request,
  _user,
  { params },
) => {
  const { id } = await params;
  const log = getLogById(id);
  if (!log) {
    return NextResponse.json(
      { error: `Log dengan ID ${id} tidak ditemukan.` },
      { status: 404 },
    );
  }
  return NextResponse.json({ log });
});

/**
 * PATCH /api/notifications/logs/:id
 * Memperbarui catatan solusi/tindak lanjut sebuah log.
 * Body: { "resolutionNote": string } — string kosong menghapus catatan.
 */
export const PATCH = withRole<LogRouteContext>([], async (
  request,
  _user,
  { params },
) => {
  const { id } = await params;

  let body: { resolutionNote?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }
  if (typeof body.resolutionNote !== "string") {
    return NextResponse.json(
      { error: "resolutionNote wajib berupa string." },
      { status: 400 },
    );
  }

  const existing = getLogById(id);
  if (!existing) {
    return NextResponse.json(
      { error: `Log dengan ID ${id} tidak ditemukan.` },
      { status: 404 },
    );
  }

  const note = body.resolutionNote.trim();
  db.update(notificationLogs)
    .set({ resolutionNote: note === "" ? null : note })
    .where(eq(notificationLogs.id, id))
    .run();

  return NextResponse.json({ log: getLogById(id) });
});
