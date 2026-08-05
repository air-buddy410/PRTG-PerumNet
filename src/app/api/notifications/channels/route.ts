import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notificationChannels } from "@/db/schema";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["telegram", "whatsapp"] as const;
type ChannelType = (typeof VALID_TYPES)[number];

interface RegisterBody {
  type?: string;
  recipientName?: string;
  target?: string;
}

/**
 * POST /api/notifications/channels
 * Mendaftarkan channel bot baru dan menerbitkan kode verifikasi 6 digit.
 * Channel berstatus belum-terverifikasi sampai kode dikonfirmasi bot.
 */
export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }

  const type = body.type?.trim() as ChannelType | undefined;
  const recipientName = body.recipientName?.trim();
  const target = body.target?.trim();

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `type wajib salah satu dari: ${VALID_TYPES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!recipientName || !target) {
    return NextResponse.json(
      { error: "recipientName dan target wajib diisi." },
      { status: 400 },
    );
  }

  const existing = db
    .select({ id: notificationChannels.id })
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.type, type),
        eq(notificationChannels.target, target),
      ),
    )
    .get();
  if (existing) {
    return NextResponse.json(
      { error: `Target ${target} (${type}) sudah terdaftar.` },
      { status: 409 },
    );
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const channel = {
    id: randomUUID(),
    type,
    recipientName,
    target,
    verified: false,
    active: false,
    verificationCode,
  };
  db.insert(notificationChannels).values(channel).run();

  return NextResponse.json(
    {
      channel: {
        id: channel.id,
        type,
        recipientName,
        target,
        verified: false,
        active: false,
      },
      verificationCode,
    },
    { status: 201 },
  );
}
