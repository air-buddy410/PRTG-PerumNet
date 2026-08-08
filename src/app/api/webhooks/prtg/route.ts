import { NextResponse } from "next/server";
import { dispatchAlert } from "@/server/notifier";

export const dynamic = "force-dynamic";

interface LegacyWebhookBody {
  sensorId?: string;
  device?: string;
  message?: string;
}

/**
 * @deprecated ALIAS LEGACY — pindah ke POST /api/v1/integrations/librenms/alerts.
 *
 * Rute ini dipertahankan sementara agar konfigurasi webhook lama tidak putus
 * selama transisi; DIHAPUS pada Fase 7. Secret legacy `PRTG_WEBHOOK_SECRET`
 * masih dihormati di sini saja.
 */
export async function POST(request: Request) {
  const secret = process.env.PRTG_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-webhook-token") !== secret) {
    return NextResponse.json(
      { error: "Token webhook tidak valid." },
      { status: 401 },
    );
  }

  let body: LegacyWebhookBody;
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
    librenmsAlertId: sensorId,
    deviceName: device,
    message,
  });

  return NextResponse.json(
    { ok: true, ...result },
    {
      status: 202,
      headers: {
        Deprecation: "true",
        Link: '</api/v1/integrations/librenms/alerts>; rel="successor-version"',
      },
    },
  );
}
