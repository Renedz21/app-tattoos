import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError, api } from "@/lib/api";

describe("ApiError", () => {
  it("is an instance of Error", () => {
    const err = new ApiError(404, { message: "not found" });
    expect(err).toBeInstanceOf(Error);
  });

  it("sets the status property", () => {
    const err = new ApiError(500, null);
    expect(err.status).toBe(500);
  });

  it("sets the body property", () => {
    const body = { error: "something went wrong" };
    const err = new ApiError(400, body);
    expect(err.body).toEqual(body);
  });

  it("sets the name to 'ApiError'", () => {
    const err = new ApiError(403, null);
    expect(err.name).toBe("ApiError");
  });

  it("sets the message to 'API error {status}'", () => {
    const err = new ApiError(422, null);
    expect(err.message).toBe("API error 422");
  });

  it("accepts null as body", () => {
    const err = new ApiError(404, null);
    expect(err.body).toBeNull();
  });

  it("accepts a string as body", () => {
    const err = new ApiError(400, "Bad Request");
    expect(err.body).toBe("Bad Request");
  });
});

describe("api", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockFetch(status: number, body: unknown, ok?: boolean) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: ok ?? (status >= 200 && status < 300),
      status,
      json: vi.fn().mockResolvedValue(body),
    });
  }

  function mockFetchJsonFailure(status: number, ok: boolean) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok,
      status,
      json: vi.fn().mockRejectedValue(new Error("invalid json")),
    });
  }

  it("returns parsed JSON on a successful response", async () => {
    const payload = { id: "abc123", name: "Test" };
    mockFetch(200, payload);

    const result = await api<typeof payload>("/api/test");
    expect(result).toEqual(payload);
  });

  it("throws ApiError when response is not ok", async () => {
    const body = { error: "not found" };
    mockFetch(404, body, false);

    await expect(api("/api/missing")).rejects.toBeInstanceOf(ApiError);
  });

  it("throws ApiError with correct status on failure", async () => {
    mockFetch(500, { error: "server error" }, false);

    try {
      await api("/api/error");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });

  it("throws ApiError with parsed body on failure", async () => {
    const body = { error: "unauthorized" };
    mockFetch(401, body, false);

    try {
      await api("/api/protected");
    } catch (err) {
      expect((err as ApiError).body).toEqual(body);
    }
  });

  it("passes Content-Type: application/json header by default", async () => {
    mockFetch(200, {});

    await api("/api/test");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("merges custom headers with the default Content-Type", async () => {
    mockFetch(200, {});

    await api("/api/test", {
      headers: { Authorization: "Bearer token123" },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer token123",
        }),
      }),
    );
  });

  it("allows overriding Content-Type via custom headers", async () => {
    mockFetch(200, {});

    await api("/api/test", {
      headers: { "Content-Type": "text/plain" },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "text/plain",
        }),
      }),
    );
  });

  it("passes method and body from init", async () => {
    mockFetch(201, { created: true });

    const body = JSON.stringify({ name: "new item" });
    await api("/api/items", { method: "POST", body });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/items",
      expect.objectContaining({ method: "POST", body }),
    );
  });

  it("sets body to null on a failed request when json() rejects", async () => {
    mockFetchJsonFailure(503, false);

    try {
      await api("/api/broken");
    } catch (err) {
      expect((err as ApiError).body).toBeNull();
    }
  });

  it("returns null body when json() rejects on a successful response", async () => {
    mockFetchJsonFailure(200, true);

    const result = await api("/api/weird");
    expect(result).toBeNull();
  });

  it("forwards all extra init options to fetch", async () => {
    mockFetch(200, {});

    await api("/api/test", { credentials: "include", cache: "no-store" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        credentials: "include",
        cache: "no-store",
      }),
    );
  });
});
