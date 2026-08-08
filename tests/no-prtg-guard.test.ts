// Guard Fase 1 (diperketat di Fase 2): istilah "PRTG" tidak boleh muncul
// lagi di src/, kecuali alias webhook deprecated (dihapus Fase 7).
// Sejak baseline PostgreSQL, schema.ts juga bebas PRTG sepenuhnya.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = path.resolve(__dirname, "..", "src");

const ALLOWLIST = [
  path.join("app", "api", "webhooks", "prtg", "route.ts"),
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("guard: tidak ada istilah PRTG tersisa di src/", () => {
  it("hanya file allowlist yang boleh menyebut PRTG", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC_DIR)) {
      const relative = path.relative(SRC_DIR, file);
      if (ALLOWLIST.includes(relative)) continue;
      const content = readFileSync(file, "utf8");
      if (/prtg/i.test(content)) offenders.push(relative);
    }
    expect(offenders).toEqual([]);
  });

  it("schema.ts hanya boleh memakai PRTG pada string kolom legacy", () => {
    const content = readFileSync(path.join(SRC_DIR, "db", "schema.ts"), "utf8");
    const withoutColumnStrings = content
      .replaceAll('"prtg_device_id"', "")
      .replaceAll('"prtg_sensor_id"', "");
    expect(/prtg/i.test(withoutColumnStrings)).toBe(false);
  });
});
