// Helper fetch JSON ke API internal. Error server ({ error } / { message })
// diangkat menjadi Error dengan pesan yang bisa langsung ditampilkan.

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function parseError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const message =
    body?.error ?? body?.message ?? `Permintaan gagal (HTTP ${response.status})`;
  return new ApiError(message, response.status);
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function sendJson<T>(
  method: "POST" | "PATCH" | "DELETE",
  url: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw await parseError(response);
  return response.json();
}
