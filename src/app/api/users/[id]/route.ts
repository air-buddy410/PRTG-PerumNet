import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { withRole, type Role } from "@/server/rbac";

export const dynamic = "force-dynamic";

const VALID_ROLES: Role[] = ["admin", "noc", "engineer", "manajemen"];

/**
 * PATCH /api/users/:id — ubah peran pengguna (khusus Admin NOC).
 * Body: { "role": "admin" | "noc" | "engineer" | "manajemen" }
 * Admin terakhir tidak boleh diturunkan agar sistem tidak kehilangan admin.
 */
export const PATCH = withRole<{ params: Promise<{ id: string }> }>(
  ["admin"],
  async (request, _user, { params }) => {
  const { id } = await params;

  let body: { role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON yang valid." },
      { status: 400 },
    );
  }
  const role = body.role as Role | undefined;
  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role wajib salah satu dari: ${VALID_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const target = db.select().from(user).where(eq(user.id, id)).get();
  if (!target) {
    return NextResponse.json(
      { error: `Pengguna dengan ID ${id} tidak ditemukan.` },
      { status: 404 },
    );
  }

  if (target.role === "admin" && role !== "admin") {
    const adminCount =
      db
        .select({ n: sql<number>`count(*)` })
        .from(user)
        .where(eq(user.role, "admin"))
        .get()?.n ?? 0;
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Tidak bisa menurunkan admin terakhir." },
        { status: 409 },
      );
    }
  }

  db.update(user).set({ role }).where(eq(user.id, id)).run();

  return NextResponse.json({
    user: { id: target.id, name: target.name, email: target.email, role },
  });
  },
);
