import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notificationChannels } from "@/db/schema";

export const dynamic = "force-dynamic";

interface VerifyBody {
  code?: string;
  chatId?: string;
}

/**
 * POST /api/notifications/channels/verify
 * Dipanggil bot saat menerima kode dari pengguna: mencocokkan kode
 * verifikasi lalu menautkan akun (chatId pengirim) ke channel. Channel yang
 * cocok menjadi terverifikasi & aktif menerima alert.
 */
export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }

  const code = body.code?.trim();
  const chatId = body.chatId?.trim();
  if (!code || !chatId) {
    return NextResponse.json(
      { error: "code dan chatId wajib diisi." },
      { status: 400 },
    );
  }

  const channel = db
    .select()
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.verificationCode, code),
        eq(notificationChannels.verified, false),
      ),
    )
    .get();

  if (!channel) {
    return NextResponse.json(
      { error: "Kode verifikasi tidak dikenal atau sudah dipakai." },
      { status: 404 },
    );
  }

  db.update(notificationChannels)
    .set({
      verified: true,
      active: true,
      verificationCode: null,
      chatId,
    })
    .where(eq(notificationChannels.id, channel.id))
    .run();

  return NextResponse.json({
    channel: {
      id: channel.id,
      type: channel.type,
      recipientName: channel.recipientName,
      target: channel.target,
      verified: true,
      active: true,
      chatId,
    },
  });
}
