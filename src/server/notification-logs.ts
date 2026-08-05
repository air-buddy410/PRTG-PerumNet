// Akses data riwayat notifikasi. Tabel di-seed sekali dari data tiruan
// saat masih kosong agar endpoint langsung berguna sebelum dispatcher
// webhook PRTG (task berikutnya) mulai menulis log asli.

import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { notificationLogs } from "@/db/schema";
import { MOCK_NOTIFICATION_LOGS } from "@/lib/mock-notifications";

export function seedLogsIfEmpty() {
  const existing = db
    .select({ id: notificationLogs.id })
    .from(notificationLogs)
    .limit(1)
    .get();
  if (existing) return;

  for (const log of MOCK_NOTIFICATION_LOGS) {
    db.insert(notificationLogs)
      .values({
        id: log.id,
        prtgSensorId: log.prtgSensorId,
        deviceName: log.deviceName,
        alertType: log.alertType,
        messageContent: log.messageContent,
        status: log.status,
        resolutionNote: log.resolutionNote ?? null,
        triggeredAt: log.triggeredAt,
      })
      .onConflictDoNothing()
      .run();
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
export function listLogs(filters: LogFilters): LogPage {
  seedLogsIfEmpty();

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

  const total =
    db
      .select({ n: sql<number>`count(*)` })
      .from(notificationLogs)
      .where(where)
      .get()?.n ?? 0;

  const logs = db
    .select()
    .from(notificationLogs)
    .where(where)
    .orderBy(desc(notificationLogs.triggeredAt))
    .limit(limit)
    .offset(offset)
    .all();

  return { logs, total, limit, offset };
}

export function getLogById(id: string) {
  seedLogsIfEmpty();
  return db
    .select()
    .from(notificationLogs)
    .where(eq(notificationLogs.id, id))
    .get();
}
