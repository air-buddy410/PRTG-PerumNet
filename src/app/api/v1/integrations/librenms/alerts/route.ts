import { NextResponse } from "next/server";
import type { LibrenmsAlertIngestResponse } from "@/server/api-v1/contracts";
import { parseLibrenmsAlert } from "@/server/librenms/alert";
import { dispatchAlert } from "@/server/notifier";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/integrations/librenms/alerts
 * Webhook ingress alert/recovery dari LibreNMS (API transport).
 *
 * Keamanan: bila LIBRENMS_WEBHOOK_SECRET di-set, permintaan wajib membawa
 * header `x-webhook-token` bernilai sama. Rate-limit + idempotency penuh
 * (anti incident ganda) menyusul bersama model incident pada Fase 4.
 */
export async function POST(request: Request) {
  const secret = process.env.LIBRENMS_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-webhook-token") !== secret) {
    return NextResponse.json(
      { error: "Token webhook tidak valid." },
      { status: 401 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }

  const parsed = parseLibrenmsAlert(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await dispatchAlert({
    librenmsAlertId: parsed.librenmsAlertId,
    deviceName: parsed.deviceName,
    message:
      parsed.state === "recovered"
        ? `✅ PULIH: ${parsed.message}`
        : parsed.message,
  });

  const body: LibrenmsAlertIngestResponse = {
    ok: true,
    librenmsAlertId: parsed.librenmsAlertId,
    state: parsed.state,
    sent: result.sent,
    failed: result.failed,
  };
  return NextResponse.json(body, { status: 202 });
}
