import { describe, expect, it } from "vitest";
import { parseLibrenmsAlert } from "@/server/librenms/alert";

describe("parseLibrenmsAlert", () => {
  it("menerima payload alert LibreNMS yang umum", () => {
    const parsed = parseLibrenmsAlert({
      alert_id: 421,
      device_id: 9,
      sysName: "olt-kebayoran-01",
      severity: "critical",
      state: 1,
      title: "Device Down",
      msg: "olt-kebayoran-01 tidak merespons ICMP",
      timestamp: "2026-08-09 04:00:00",
    });
    expect(parsed).toMatchObject({
      librenmsAlertId: "421",
      librenmsDeviceId: 9,
      deviceName: "olt-kebayoran-01",
      severity: "critical",
      state: "alerting",
    });
    if ("message" in parsed) {
      expect(parsed.message).toContain("Device Down");
      expect(parsed.message).toContain("tidak merespons ICMP");
    }
  });

  it("state 0 / 'ok' dinormalkan menjadi recovered", () => {
    for (const state of [0, "0", "ok", "recovered"]) {
      const parsed = parseLibrenmsAlert({
        id: "77",
        state,
        title: "Device Up",
        hostname: "core-menteng-01",
      });
      expect(parsed).toMatchObject({ state: "recovered" });
    }
  });

  it("severity tak dikenal jatuh ke critical (fail-safe)", () => {
    const parsed = parseLibrenmsAlert({
      alert_id: "5",
      severity: "disaster",
      title: "X",
    });
    expect(parsed).toMatchObject({ severity: "critical" });
  });

  it("menolak payload tanpa alert_id", () => {
    const parsed = parseLibrenmsAlert({ title: "tanpa id" });
    expect(parsed).toHaveProperty("error");
  });

  it("menolak payload tanpa title/msg", () => {
    const parsed = parseLibrenmsAlert({ alert_id: 1 });
    expect(parsed).toHaveProperty("error");
  });

  it("menolak body non-objek", () => {
    expect(parseLibrenmsAlert("bukan objek")).toHaveProperty("error");
    expect(parseLibrenmsAlert(null)).toHaveProperty("error");
  });

  it("device_id string numerik dikonversi ke number", () => {
    const parsed = parseLibrenmsAlert({
      alert_id: 8,
      device_id: "12",
      title: "T",
    });
    expect(parsed).toMatchObject({ librenmsDeviceId: 12 });
  });
});
