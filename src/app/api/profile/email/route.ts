import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PATCH /api/profile/email — ganti email akun yang sedang login.
 * (Better Auth change-email membutuhkan alur verifikasi email; endpoint ini
 * memperbarui langsung dan menandai email sebagai belum terverifikasi.)
 */
export const PATCH = withRole([], async (request, sessionUser) => {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "email tidak valid." },
      { status: 400 },
    );
  }

  const taken = db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .get();
  if (taken && taken.id !== sessionUser.id) {
    return NextResponse.json(
      { error: `Email ${email} sudah dipakai akun lain.` },
      { status: 409 },
    );
  }

  db.update(user)
    .set({ email, emailVerified: false })
    .where(eq(user.id, sessionUser.id))
    .run();

  return NextResponse.json({
    user: { id: sessionUser.id, name: sessionUser.name, email },
  });
});
