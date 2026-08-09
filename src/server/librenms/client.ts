// Klien HTTP LibreNMS API v0 — HANYA berjalan di server.
// Token dibaca dari environment dan tidak pernah dikirim ke browser.

export class LibrenmsError extends Error {
  constructor(
    message: string,
    public readonly status: number | null = null,
  ) {
    super(message);
    this.name = "LibrenmsError";
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Adapter LibreNMS hanya boleh dipakai di server (token rahasia).",
    );
  }
}

/** true bila LIBRENMS_URL & LIBRENMS_TOKEN tersedia (mode terhubung). */
export function isLibrenmsConfigured(): boolean {
  return Boolean(process.env.LIBRENMS_URL && process.env.LIBRENMS_TOKEN);
}

function baseUrl(): string {
  const url = process.env.LIBRENMS_URL;
  if (!url) {
    throw new LibrenmsError(
      "LIBRENMS_URL tidak di-set — aplikasi berjalan dalam mode fixture.",
    );
  }
  return url.replace(/\/+$/, "");
}

export interface LibrenmsFetchOptions {
  /** Terima respons non-JSON (mis. PNG graph). */
  binary?: boolean;
  timeoutMs?: number;
}

export async function librenmsFetch<T>(
  path: string,
  options: LibrenmsFetchOptions = {},
): Promise<T> {
  assertServerOnly();
  const token = process.env.LIBRENMS_TOKEN;
  if (!token) {
    throw new LibrenmsError(
      "LIBRENMS_TOKEN tidak di-set — aplikasi berjalan dalam mode fixture.",
    );
  }

  const url = `${baseUrl()}/api/v0${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "X-Auth-Token": token,
        ...(options.binary ? {} : { Accept: "application/json" }),
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new LibrenmsError(
      `Gagal menghubungi LibreNMS (${url.replace(token, "***")}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (!response.ok) {
    throw new LibrenmsError(
      `LibreNMS menjawab HTTP ${response.status} untuk ${path}`,
      response.status,
    );
  }

  if (options.binary) {
    return Buffer.from(await response.arrayBuffer()) as T;
  }
  return (await response.json()) as T;
}
