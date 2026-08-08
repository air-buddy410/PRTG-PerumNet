// Invarian baseline schema PostgreSQL (Fase 2): tabel wajib ada, tabel
// telemetry era SQLite tidak boleh ikut, dan index kunci harus terbentuk.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_DIR = path.resolve(__dirname, "..", "drizzle", "pg");

const sql = readdirSync(MIGRATION_DIR)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(path.join(MIGRATION_DIR, file), "utf8"))
  .join("\n");

const REQUIRED_TABLES = [
  // domain portal
  "assets",
  "crm_service_mappings",
  "incidents",
  "audit_logs",
  "notification_deliveries",
  "topologies",
  "topology_nodes",
  "topology_links",
  "topology_discovery_suggestions",
  "topology_versions",
  // carry-over
  "notification_channels",
  "notification_logs",
  "sla_reports",
  "sla_monthly",
  "traffic_monthly",
  // auth
  "user",
  "session",
  "account",
  "verification",
];

const RETIRED_TABLES = [
  "device_metadata",
  "device_metrics",
  "port_metrics",
  "pon_port_samples",
  "onu_status_samples",
  "metric_history",
];

describe("baseline schema PostgreSQL", () => {
  it("seluruh tabel wajib dokumen tersedia", () => {
    for (const table of REQUIRED_TABLES) {
      expect(sql, `tabel ${table} hilang`).toMatch(
        new RegExp(`CREATE TABLE "${table}"`),
      );
    }
  });

  it("tabel telemetry era SQLite tidak ikut ke PostgreSQL", () => {
    for (const table of RETIRED_TABLES) {
      expect(sql).not.toMatch(new RegExp(`CREATE TABLE "${table}"`));
    }
  });

  it("idempotency incident: partial unique index untuk alert belum-resolved", () => {
    expect(sql).toContain("incidents_active_alert_idx");
    expect(sql).toMatch(/state.*<>.*'resolved'/);
  });

  it("kolom rename tuntas: tidak ada lagi kolom prtg_*", () => {
    expect(sql.toLowerCase()).not.toContain("prtg");
  });

  it("relasi kunci: nodes→assets cascade, versions unik per (topology, version)", () => {
    expect(sql).toContain("topology_nodes_topology_asset_idx");
    expect(sql).toContain("topology_versions_topology_version_idx");
    expect(sql).toContain("crm_service_mappings_service_idx");
  });
});
