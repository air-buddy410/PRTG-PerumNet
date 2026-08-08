import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { withRole } from "@/server/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/users — daftar seluruh pengguna aplikasi beserta perannya.
 * Hanya untuk Admin NOC.
 */
export const GET = withRole(["admin"], async () => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.createdAt))
    ;

  return NextResponse.json({ users, total: users.length });
});
