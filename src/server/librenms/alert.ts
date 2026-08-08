// Normalisasi payload alert transport API LibreNMS menjadi bentuk internal
// Portal. Pure function agar mudah diuji tanpa HTTP.
//
// LibreNMS "API transport" mengirim JSON yang bidangnya dapat dikustomisasi;
// contract Portal menerima bidang umum berikut (semuanya best-effort):
//   alert_id | id      → identitas alert (wajib, dipakai idempotency Fase 4)
//   state              → 1/"alerting" = firing, 0/"ok"/"recovered" = pulih
//   severity           → "ok" | "warning" | "critical" (default "critical")
//   sysName | hostname | host → nama perangkat
//   device_id          → ID device LibreNMS (opsional)
//   title, msg         → isi pesan
//   timestamp          → waktu kejadian (opsional, ISO/epoch)

export type AlertSeverity = "ok" | "warning" | "critical";
export type AlertState = "alerting" | "recovered";

export interface NormalizedLibrenmsAlert {
  librenmsAlertId: string;
  librenmsDeviceId: number | null;
  deviceName: string;
  severity: AlertSeverity;
  state: AlertState;
  message: string;
  timestamp: string | null;
}

export interface AlertParseError {
  error: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(
  body: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  return null;
}

function parseState(value: unknown): AlertState | null {
  if (value === 1 || value === "1" || value === "alerting" || value === "alert")
    return "alerting";
  if (
    value === 0 ||
    value === "0" ||
    value === "ok" ||
    value === "recovered" ||
    value === "recover"
  )
    return "recovered";
  return null;
}

function parseSeverity(value: unknown): AlertSeverity {
  if (value === "ok" || value === "warning" || value === "critical")
    return value;
  return "critical";
}

export function parseLibrenmsAlert(
  raw: unknown,
): NormalizedLibrenmsAlert | AlertParseError {
  const body = asRecord(raw);
  if (!body) return { error: "Body harus berupa objek JSON." };

  const alertId = firstString(body, ["alert_id", "id", "uid"]);
  if (!alertId) {
    return { error: "alert_id (atau id) wajib ada pada payload alert." };
  }

  const state = parseState(body.state) ?? "alerting";

  const deviceName =
    firstString(body, ["sysName", "hostname", "host", "device"]) ??
    "Perangkat tidak dikenal";

  const deviceIdRaw = body.device_id;
  const librenmsDeviceId =
    typeof deviceIdRaw === "number" && Number.isInteger(deviceIdRaw)
      ? deviceIdRaw
      : typeof deviceIdRaw === "string" && /^\d+$/.test(deviceIdRaw)
        ? Number(deviceIdRaw)
        : null;

  const title = firstString(body, ["title"]);
  const msg = firstString(body, ["msg", "message"]);
  const message = [title, msg].filter(Boolean).join(" — ");
  if (message === "") {
    return { error: "title atau msg wajib ada pada payload alert." };
  }

  return {
    librenmsAlertId: alertId,
    librenmsDeviceId,
    deviceName,
    severity: parseSeverity(body.severity),
    state,
    message,
    timestamp: firstString(body, ["timestamp"]),
  };
}
