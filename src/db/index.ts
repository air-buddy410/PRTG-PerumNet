// Klien database Portal — PostgreSQL (Fase 2).
//
// - Produksi/staging : set DATABASE_URL → driver node-postgres (Pool).
// - Development      : tanpa DATABASE_URL → PGlite (PostgreSQL WASM,
//   file-backed di ./data/pglite). Semantik SQL tetap PostgreSQL asli,
//   tanpa instalasi server. Catatan: PGlite bersifat single-process; untuk
//   beberapa proses sekaligus gunakan Postgres via docker-compose.dev.yml.

import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import * as authSchema from "@/db/auth-schema";
import * as schema from "@/db/schema";

const fullSchema = { ...schema, ...authSchema };
type FullSchema = typeof fullSchema;

const PGLITE_DIR =
  process.env.PGLITE_DIR ?? path.join(process.cwd(), "data", "pglite");

function buildDb() {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzleNodePg(pool, { schema: fullSchema });
  }
  fs.mkdirSync(path.dirname(PGLITE_DIR), { recursive: true });
  const client = new PGlite(PGLITE_DIR);
  return drizzlePglite(client, { schema: fullSchema });
}

// Kedua driver berbagi API query Drizzle yang sama; disatukan pada tipe
// NodePgDatabase agar seluruh call-site memakai satu tipe.
export const db = buildDb() as NodePgDatabase<FullSchema>;
