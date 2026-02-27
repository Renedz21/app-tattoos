/**
 * Typed fetch wrapper used by all client hooks.
 * Keeps fetch calls out of UI components (Clean Code).
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json);
  }

  return json as T;
}
