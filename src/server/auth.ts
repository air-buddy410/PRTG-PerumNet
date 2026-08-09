// Konfigurasi Better Auth (autentikasi & sesi, sesuai tech stack PRD).
// Email + kata sandi; setiap user membawa field `role` untuk RBAC
// (admin | noc | engineer | manajemen — default engineer).

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

const localTrustedOrigins = [
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  "http://10.10.2.235:3002",
];

const configuredTrustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  // Better Auth validates Origin for state-changing requests. Keep local
  // development and LAN preview origins explicit; production origins can be
  // supplied through AUTH_TRUSTED_ORIGINS as a comma-separated allowlist.
  trustedOrigins: [...new Set([...localTrustedOrigins, ...configuredTrustedOrigins])],
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
