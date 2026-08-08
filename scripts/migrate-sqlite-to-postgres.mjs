#!/usr/bin/env node
// Migrasi data SQLite (era Fase 1) → PostgreSQL (baseline Fase 2).
//
// Pakai:
//   node scripts/migrate-sqlite-to-postgres.mjs [path-sqlite]
//     - path-sqlite default: ./data/perumnet.db
//     - target: DATABASE_URL (PostgreSQL) bila di-set, selain itu PGlite
//       pada PGLITE_DIR (default ./data/pglite)
//
// Prasyarat: schema target sudah diterapkan (npx drizzle-kit migrate).
// Sifat: idempoten (ON CONFLICT DO NOTHING); sumber SQLite dibuka read-only
// dan TIDAK diubah — file lama adalah artefak rollback.
// Lihat docs/DB_MIGRATION.md untuk prosedur lengkap & rollback.

import Database from "better-sqlite3";
import {
  mapDeviceMetadataToAsset,
  mapNotificationLog,
  msToDate,
  intToBool,
  textTsToDate,
  SKIPPED_TABLES,
} from "./migrate-lib.mjs";

const sqlitePath = process.argv[2] ?? "./data/perumnet.db";

async function openTarget() {
  if (process.env.DATABASE_URL) {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    return {
      label: `PostgreSQL (${new URL(process.env.DATABASE_URL).host})`,
      query: (text, params) => client.query(text, params),
      close: () => client.end(),
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? "./data/pglite";
  const client = new PGlite(dir);
  return {
    label: `PGlite (${dir})`,
    query: (text, params) => client.query(text, params),
    close: () => client.close(),
  };
}

function insertSql(table, columns) {
  const quoted = table === "user" ? '"user"' : table;
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  return `INSERT INTO ${quoted} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
}

async function copyRows(target, table, rows, toColumns) {
  let inserted = 0;
  for (const row of rows) {
    const mapped = toColumns(row);
    const columns = Object.keys(mapped);
    const values = Object.values(mapped).map((v) =>
      Array.isArray(v) || (v !== null && typeof v === "object" && !(v instanceof Date))
        ? JSON.stringify(v)
        : v,
    );
    const result = await target.query(insertSql(table, columns), values);
    // node-postgres memakai rowCount; PGlite memakai affectedRows.
    inserted += result.rowCount ?? result.affectedRows ?? 0;
  }
  console.log(`  ${table.padEnd(24)} ${String(inserted).padStart(4)} / ${rows.length} baris`);
  return inserted;
}

const sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });
const target = await openTarget();
console.log(`Sumber : SQLite ${sqlitePath} (read-only)`);
console.log(`Target : ${target.label}`);
console.log(`Dilewati (mock/telemetry): ${SKIPPED_TABLES.join(", ")}`);
console.log("");

const all = (sql) => sqlite.prepare(sql).all();

// Urutan FK-safe: user → session/account/verification → assets →
// notification_channels → notification_logs → sla_reports.
await copyRows(target, "user", all("SELECT * FROM user"), (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  email_verified: intToBool(r.email_verified),
  image: r.image ?? null,
  created_at: msToDate(r.created_at) ?? new Date(),
  updated_at: msToDate(r.updated_at) ?? new Date(),
  role: r.role ?? "engineer",
}));

await copyRows(target, "session", all("SELECT * FROM session"), (r) => ({
  id: r.id,
  expires_at: msToDate(r.expires_at),
  token: r.token,
  created_at: msToDate(r.created_at) ?? new Date(),
  updated_at: msToDate(r.updated_at) ?? new Date(),
  ip_address: r.ip_address ?? null,
  user_agent: r.user_agent ?? null,
  user_id: r.user_id,
}));

await copyRows(target, "account", all("SELECT * FROM account"), (r) => ({
  id: r.id,
  account_id: r.account_id,
  provider_id: r.provider_id,
  user_id: r.user_id,
  access_token: r.access_token ?? null,
  refresh_token: r.refresh_token ?? null,
  id_token: r.id_token ?? null,
  access_token_expires_at: msToDate(r.access_token_expires_at),
  refresh_token_expires_at: msToDate(r.refresh_token_expires_at),
  scope: r.scope ?? null,
  password: r.password ?? null,
  created_at: msToDate(r.created_at) ?? new Date(),
  updated_at: msToDate(r.updated_at) ?? new Date(),
}));

await copyRows(target, "verification", all("SELECT * FROM verification"), (r) => ({
  id: r.id,
  identifier: r.identifier,
  value: r.value,
  expires_at: msToDate(r.expires_at),
  created_at: msToDate(r.created_at) ?? new Date(),
  updated_at: msToDate(r.updated_at) ?? new Date(),
}));

await copyRows(
  target,
  "assets",
  all("SELECT * FROM device_metadata"),
  mapDeviceMetadataToAsset,
);

await copyRows(
  target,
  "notification_channels",
  all("SELECT * FROM notification_channels"),
  (r) => ({
    id: r.id,
    type: r.type,
    recipient_name: r.recipient_name,
    target: r.target,
    verified: intToBool(r.verified),
    active: intToBool(r.active),
    verification_code: r.verification_code ?? null,
    chat_id: r.chat_id ?? null,
    created_at: textTsToDate(r.created_at) ?? new Date(),
  }),
);

await copyRows(
  target,
  "notification_logs",
  all("SELECT * FROM notification_logs"),
  mapNotificationLog,
);

await copyRows(target, "sla_reports", all("SELECT * FROM sla_reports"), (r) => ({
  id: r.id,
  report_name: r.report_name,
  report_type: r.report_type,
  format_type: r.format_type,
  period: r.period,
  user_id: r.user_id ?? null,
  generated_at: textTsToDate(r.generated_at) ?? new Date(),
}));

console.log("\nSelesai. Sumber SQLite tidak diubah (artefak rollback).");
sqlite.close();
await target.close();
