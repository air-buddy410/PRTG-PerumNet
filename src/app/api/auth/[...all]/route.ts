import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth";

// Meng-handle seluruh endpoint Better Auth, a.l.:
//   POST /api/auth/sign-up/email  → daftar akun baru
//   POST /api/auth/sign-in/email  → masuk
//   POST /api/auth/sign-out       → keluar
//   GET  /api/auth/get-session    → sesi aktif
export const { GET, POST } = toNextJsHandler(auth.handler);
