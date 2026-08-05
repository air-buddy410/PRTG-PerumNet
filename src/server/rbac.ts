// Helper RBAC: memeriksa sesi Better Auth pada permintaan dan mencocokkan
// peran pengguna terhadap daftar peran yang diizinkan.

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export type Role = "admin" | "noc" | "engineer" | "manajemen";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type RbacResult =
  | { ok: true; user: SessionUser }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Ambil sesi dari cookie permintaan lalu pastikan perannya termasuk
 * `allowedRoles`. Daftar kosong berarti cukup login (peran apa pun).
 */
export async function requireRole(
  request: Request,
  allowedRoles: Role[] = [],
): Promise<RbacResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return { ok: false, status: 401, error: "Belum login." };
  }

  const role = (session.user.role ?? "engineer") as Role;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return {
      ok: false,
      status: 403,
      error: `Akses ditolak: butuh peran ${allowedRoles.join("/")}.`,
    };
  }

  return {
    ok: true,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
    },
  };
}

/**
 * Middleware rute API: membungkus handler dengan pemeriksaan peran.
 * 401 bila belum login, 403 bila peran tidak diizinkan; selain itu handler
 * dipanggil dengan `user` tervalidasi. Daftar peran kosong = cukup login.
 *
 *   export const GET = withRole(["admin"], async (request, user) => { … });
 */
export function withRole<Context>(
  allowedRoles: Role[],
  handler: (
    request: Request,
    user: SessionUser,
    context: Context,
  ) => Promise<Response>,
) {
  return async (request: Request, context: Context): Promise<Response> => {
    const access = await requireRole(request, allowedRoles);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      );
    }
    return handler(request, access.user, context);
  };
}
