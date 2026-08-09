// Test klien HTTP LibreNMS: bentuk request, header token, dan error —
// seluruh jaringan di-mock; tidak pernah menghubungi server nyata.

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isLibrenmsConfigured,
  librenmsFetch,
  LibrenmsError,
} from "@/server/librenms/client";

function stubFetch(response: Partial<Response> & { json?: () => unknown }) {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    arrayBuffer: async () => new ArrayBuffer(4),
    ...response,
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("isLibrenmsConfigured", () => {
  it("false tanpa env — aplikasi berjalan mode fixture", () => {
    vi.stubEnv("LIBRENMS_URL", "");
    vi.stubEnv("LIBRENMS_TOKEN", "");
    expect(isLibrenmsConfigured()).toBe(false);
  });

  it("false bila hanya URL tanpa token", () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "");
    expect(isLibrenmsConfigured()).toBe(false);
  });

  it("true bila URL dan token tersedia", () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "tkn");
    expect(isLibrenmsConfigured()).toBe(true);
  });
});

describe("librenmsFetch", () => {
  it("membangun URL /api/v0 + header X-Auth-Token", async () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "rahasia-token");
    const mock = stubFetch({ json: async () => ({ status: "ok" }) });

    await librenmsFetch("/devices?type=all");

    expect(mock).toHaveBeenCalledOnce();
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe("https://nms.example.test/api/v0/devices?type=all");
    expect(init.headers["X-Auth-Token"]).toBe("rahasia-token");
    expect(init.headers.Accept).toBe("application/json");
  });

  it("membuang trailing slash pada LIBRENMS_URL", async () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test///");
    vi.stubEnv("LIBRENMS_TOKEN", "tkn");
    const mock = stubFetch({});

    await librenmsFetch("/alerts?state=1");

    expect(mock.mock.calls[0][0]).toBe(
      "https://nms.example.test/api/v0/alerts?state=1",
    );
  });

  it("melempar LibrenmsError tanpa token (mode fixture)", async () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "");
    await expect(librenmsFetch("/devices")).rejects.toBeInstanceOf(
      LibrenmsError,
    );
  });

  it("melempar LibrenmsError ber-status pada respons non-2xx", async () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "tkn");
    stubFetch({ ok: false, status: 401 });

    const error = await librenmsFetch("/devices").catch((err) => err);
    expect(error).toBeInstanceOf(LibrenmsError);
    expect((error as LibrenmsError).status).toBe(401);
  });

  it("membungkus kegagalan jaringan sebagai LibrenmsError", async () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "tkn");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const error = await librenmsFetch("/devices").catch((err) => err);
    expect(error).toBeInstanceOf(LibrenmsError);
    expect((error as LibrenmsError).message).toContain("ECONNREFUSED");
  });

  it("mode binary mengembalikan Buffer (graph PNG)", async () => {
    vi.stubEnv("LIBRENMS_URL", "https://nms.example.test");
    vi.stubEnv("LIBRENMS_TOKEN", "tkn");
    stubFetch({ arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer });

    const result = await librenmsFetch<Buffer>("/devices/1/device_bits", {
      binary: true,
    });
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(3);
  });
});
