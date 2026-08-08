import { defineConfig } from "drizzle-kit";

// Baseline PostgreSQL (Fase 2). Migrasi SQLite lama diarsipkan di ./drizzle
// (riwayat era SQLite, tidak dipakai lagi) — lihat docs/DB_MIGRATION.md.
export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  out: "./drizzle/pg",
  ...(process.env.DATABASE_URL
    ? { dbCredentials: { url: process.env.DATABASE_URL } }
    : {
        driver: "pglite",
        dbCredentials: { url: process.env.PGLITE_DIR ?? "./data/pglite" },
      }),
});
