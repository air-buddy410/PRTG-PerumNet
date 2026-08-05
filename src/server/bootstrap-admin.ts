// Bootstrap akun Admin NOC pertama: RBAC butuh minimal satu admin agar
// pengaturan peran bisa dilakukan dari dalam aplikasi. Dijalankan sekali
// saat server start (instrumentation); tidak melakukan apa-apa bila sudah
// ada user ber-peran admin.

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { auth } from "@/server/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@perumnet.co.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "perumnet123";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin NOC";

export async function ensureAdminUser() {
  const existingAdmin = db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"))
    .limit(1)
    .get();
  if (existingAdmin) return;

  const existingByEmail = db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1)
    .get();

  let adminId = existingByEmail?.id;
  if (!adminId) {
    const created = await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
    adminId = created.user.id;
  }

  db.update(user).set({ role: "admin" }).where(eq(user.id, adminId)).run();
  console.log(`[bootstrap] akun Admin NOC siap: ${ADMIN_EMAIL}`);
}
