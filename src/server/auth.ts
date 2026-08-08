// Konfigurasi Better Auth (autentikasi & sesi, sesuai tech stack PRD).
// Email + kata sandi; setiap user membawa field `role` untuk RBAC
// (admin | noc | engineer | manajemen — default engineer).

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "engineer",
        input: false, // peran tidak boleh di-set sendiri saat daftar
      },
    },
  },
});
