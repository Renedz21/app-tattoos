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
  const { headers: customHeaders, ...restInit } = init ?? {};

  const res = await fetch(url, {
    ...restInit,
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders ?? {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json);
  }

  return json as T;
}
