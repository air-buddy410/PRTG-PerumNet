import { NextResponse } from "next/server";
import { dispatchAlert } from "@/server/notifier";

export const dynamic = "force-dynamic";

interface PrtgWebhookBody {
  sensorId?: string;
  device?: string;
  message?: string;
}

/**
 * POST /api/webhooks/prtg
 * Menerima notifikasi HTTP action dari PRTG lalu meneruskannya ke semua
 * channel WhatsApp/Telegram aktif via dispatcher.
 *
 * Keamanan: bila PRTG_WEBHOOK_SECRET di-set, permintaan wajib menyertakan
 * header `x-webhook-token` dengan nilai yang sama.
 */
export async function POST(request: Request) {
  const secret = process.env.PRTG_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-webhook-token") !== secret) {
    return NextResponse.json(
      { error: "Token webhook tidak valid." },
      { status: 401 },
    );
  }

  let body: PrtgWebhookBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }

  const sensorId = body.sensorId?.trim();
  const device = body.device?.trim();
  const message = body.message?.trim();
  if (!sensorId || !device || !message) {
    return NextResponse.json(
      { error: "sensorId, device, dan message wajib diisi." },
      { status: 400 },
    );
  }

  const result = await dispatchAlert({
    prtgSensorId: sensorId,
    deviceName: device,
    message,
  });

  return NextResponse.json({ ok: true, ...result }, { status: 202 });
}
