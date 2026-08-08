// Akses data riwayat notifikasi (tabel LEGACY-AKTIF `notification_logs`,
// lihat catatan pada src/db/schema.ts). Tabel di-seed sekali dari fixture
// development saat masih kosong agar endpoint langsung berguna sebelum
// webhook LibreNMS mulai menulis log asli.

import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { notificationLogs } from "@/db/schema";
import { MOCK_NOTIFICATION_LOGS } from "@/lib/mock-notifications";

export async function seedLogsIfEmpty() {
  const [existing] = await db
    .select({ id: notificationLogs.id })
    .from(notificationLogs)
    .limit(1);
  if (existing) return;

  for (const log of MOCK_NOTIFICATION_LOGS) {
    await db
      .insert(notificationLogs)
      .values({
        id: log.id,
        librenmsAlertId: log.librenmsAlertId,
        deviceName: log.deviceName,
        alertType: log.alertType,
        messageContent: log.messageContent,
        status: log.status,
        resolutionNote: log.resolutionNote ?? null,
        triggeredAt: new Date(log.triggeredAt),
      })
      .onConflictDoNothing();
  }
}

export interface LogFilters {
  q?: string;
  channel?: "telegram" | "whatsapp";
  status?: "sent" | "failed";
  limit?: number;
  offset?: number;
}

export interface LogPage {
  logs: (typeof notificationLogs.$inferSelect)[];
  /** Jumlah total baris yang cocok filter (tanpa limit/offset). */
  total: number;
  limit: number;
  offset: number;
}

// Penyaringan di level SQL agar tetap ringan saat log membesar.
export async function listLogs(filters: LogFilters): Promise<LogPage> {
  await seedLogsIfEmpty();

  const conditions = [];
  if (filters.channel) {
    conditions.push(eq(notificationLogs.alertType, filters.channel));
  }
  if (filters.status) {
    conditions.push(eq(notificationLogs.status, filters.status));
  }
  if (filters.q) {
    const pattern = `%${filters.q.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${notificationLogs.deviceName})`, pattern),
        like(sql`lower(${notificationLogs.messageContent})`, pattern),
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const [{ n: total } = { n: 0 }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notificationLogs)
    .where(where);

  const logs = await db
    .select()
    .from(notificationLogs)
    .where(where)
    .orderBy(desc(notificationLogs.triggeredAt))
    .limit(limit)
    .offset(offset);

  return { logs, total, limit, offset };
}

export async function getLogById(id: string) {
  await seedLogsIfEmpty();
  const [log] = await db
    .select()
    .from(notificationLogs)
    .where(eq(notificationLogs.id, id))
    .limit(1);
  return log ?? null;
}
