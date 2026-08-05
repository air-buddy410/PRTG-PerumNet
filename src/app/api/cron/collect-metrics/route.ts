import { NextResponse } from "next/server";
import { collectMetricsOnce } from "@/server/collector";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/collect-metrics
 * Menjalankan satu siklus pengumpulan metrik (idempotent). Selain interval
 * in-process, endpoint ini bisa dipanggil scheduler eksternal (crontab/
 * Vercel Cron) atau manual saat debugging.
 */
export async function POST() {
  const result = await collectMetricsOnce();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET() {
  return POST();
}
