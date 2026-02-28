import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdminLeadForm } from "@/modules/admin/hooks/use-deposit-form";
import { RequestStatus } from "@/lib/generated/prisma/enums";
import * as apiModule from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(`API error ${status}`);
      this.name = "ApiError";
      this.status = status;
      this.body = body;
    }
  },
}));

const mockApi = vi.mocked(apiModule.api);

const defaultDefaults = {
  id: "clxyz1234567890abcdef",
  priceCents: 10000,
  depositCents: 3000,
  status: RequestStatus.SENT,
};

describe("useAdminLeadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("initialises isSubmitting to false", () => {
      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));
      expect(result.current.isSubmitting).toBe(false);
    });

    it("initialises result to null", () => {
      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));
      expect(result.current.result).toBeNull();
    });

    it("exposes form, handleSubmit, isSubmitting, result, and clearResult", () => {
      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));
      expect(result.current.form).toBeDefined();
      expect(result.current.handleSubmit).toBeTypeOf("function");
      expect(result.current.isSubmitting).toBeTypeOf("boolean");
      expect(result.current.clearResult).toBeTypeOf("function");
    });

    it("seeds form default values from defaults prop", () => {
      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));
      const values = result.current.form.getValues();
      expect(values.priceCents).toBe(defaultDefaults.priceCents);
      expect(values.depositCents).toBe(defaultDefaults.depositCents);
      expect(values.status).toBe(defaultDefaults.status);
    });

    it("seeds undefined when defaults contain null values", () => {
      const { result } = renderHook(() =>
        useAdminLeadForm({ id: "abc", priceCents: null, depositCents: null, status: null }),
      );
      const values = result.current.form.getValues();
      expect(values.priceCents).toBeUndefined();
      expect(values.depositCents).toBeUndefined();
      expect(values.status).toBeUndefined();
    });
  });

  describe("clearResult", () => {
    it("resets result back to null", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 20000,
          depositCents: 5000,
          status: RequestStatus.SENT,
        });
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.clearResult();
      });

      expect(result.current.result).toBeNull();
    });
  });

  describe("handleSubmit — no changes", () => {
    it("does not call api when nothing has changed", async () => {
      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: defaultDefaults.status,
        });
      });

      expect(mockApi).not.toHaveBeenCalled();
      expect(result.current.result).toEqual({ ok: true });
    });
  });

  describe("handleSubmit — quote changes", () => {
    it("calls /quote endpoint when priceCents changes", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 20000,
          depositCents: defaultDefaults.depositCents,
          status: defaultDefaults.status,
        });
      });

      expect(mockApi).toHaveBeenCalledWith(
        `/api/admin/requests/${defaultDefaults.id}/quote`,
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("calls /quote endpoint when depositCents changes", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: 6000,
          status: defaultDefaults.status,
        });
      });

      expect(mockApi).toHaveBeenCalledWith(
        `/api/admin/requests/${defaultDefaults.id}/quote`,
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("sends priceCents, depositCents and currency in the quote body", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 25000,
          depositCents: 8000,
          status: defaultDefaults.status,
        });
      });

      const [, init] = mockApi.mock.calls[0];
      const body = JSON.parse(init!.body as string);
      expect(body).toMatchObject({
        priceCents: 25000,
        depositCents: 8000,
        currency: "PEN",
      });
    });

    it("sets result to { ok: false } when both price and deposit are missing", async () => {
      const { result } = renderHook(() =>
        useAdminLeadForm({ id: "abc", priceCents: null, depositCents: null, status: null }),
      );

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 5000,
          depositCents: undefined,
          status: undefined,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
      expect(mockApi).not.toHaveBeenCalled();
    });

    it("sets result to { ok: false } with a message on /quote ApiError", async () => {
      const { ApiError } = await import("@/lib/api");
      mockApi.mockRejectedValue(new ApiError(422, { error: "invalid" }));

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 20000,
          depositCents: 5000,
          status: defaultDefaults.status,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
      expect((result.current.result as { ok: false; message: string }).message).toContain("422");
    });

    it("sets result to { ok: false } with a generic message on unknown /quote error", async () => {
      mockApi.mockRejectedValue(new Error("network down"));

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 20000,
          depositCents: 5000,
          status: defaultDefaults.status,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
    });
  });

  describe("handleSubmit — status changes", () => {
    it("calls /status endpoint when status changes", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.QUOTED,
        });
      });

      expect(mockApi).toHaveBeenCalledWith(
        `/api/admin/requests/${defaultDefaults.id}/status`,
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("sends the new status in the body", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.FINISHED,
        });
      });

      const [, init] = mockApi.mock.calls[0];
      const body = JSON.parse(init!.body as string);
      expect(body.status).toBe(RequestStatus.FINISHED);
    });

    it("includes appointmentAt in the body when provided", async () => {
      mockApi.mockResolvedValue({});

      const appointmentAt = new Date("2025-09-01T10:00:00.000Z");
      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.APPOINTMENT_CONFIRMED,
          appointmentAt,
        });
      });

      const [, init] = mockApi.mock.calls[0];
      const body = JSON.parse(init!.body as string);
      expect(body.appointmentAt).toBeDefined();
    });

    it("does not include appointmentAt in the body when absent", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.QUOTED,
        });
      });

      const [, init] = mockApi.mock.calls[0];
      const body = JSON.parse(init!.body as string);
      expect(body.appointmentAt).toBeUndefined();
    });

    it("sets result to { ok: false } with invalid_transition message on guard error", async () => {
      const { ApiError } = await import("@/lib/api");
      mockApi.mockRejectedValue(
        new ApiError(422, { error: "invalid_transition", current: "SENT", target: "FINISHED" }),
      );

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.FINISHED,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
      const msg = (result.current.result as { ok: false; message: string }).message;
      expect(msg).toContain("SENT");
      expect(msg).toContain("FINISHED");
    });

    it("sets result to { ok: false } on a generic /status ApiError", async () => {
      const { ApiError } = await import("@/lib/api");
      mockApi.mockRejectedValue(new ApiError(500, { error: "server_error" }));

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.QUOTED,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
      const msg = (result.current.result as { ok: false; message: string }).message;
      expect(msg).toContain("500");
    });

    it("sets result to { ok: false } on an unknown /status error", async () => {
      mockApi.mockRejectedValue(new Error("connection refused"));

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: defaultDefaults.priceCents,
          depositCents: defaultDefaults.depositCents,
          status: RequestStatus.QUOTED,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
    });
  });

  describe("handleSubmit — both quote and status change", () => {
    it("calls both /quote and /status when both change", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 30000,
          depositCents: 10000,
          status: RequestStatus.QUOTED,
        });
      });

      const urls = mockApi.mock.calls.map(([url]) => url as string);
      expect(urls.some((u) => u.includes("/quote"))).toBe(true);
      expect(urls.some((u) => u.includes("/status"))).toBe(true);
    });

    it("sets result { ok: true } when both calls succeed", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 30000,
          depositCents: 10000,
          status: RequestStatus.QUOTED,
        });
      });

      expect(result.current.result).toEqual({ ok: true });
    });

    it("collects errors from both calls and sets result { ok: false }", async () => {
      const { ApiError } = await import("@/lib/api");
      mockApi
        .mockRejectedValueOnce(new ApiError(422, { error: "quote_error" }))
        .mockRejectedValueOnce(new ApiError(500, { error: "status_error" }));

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 30000,
          depositCents: 10000,
          status: RequestStatus.QUOTED,
        });
      });

      expect(result.current.result).toMatchObject({ ok: false });
      const msg = (result.current.result as { ok: false; message: string }).message;
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  describe("isSubmitting flag", () => {
    it("resets isSubmitting to false after a successful submit", async () => {
      mockApi.mockResolvedValue({});

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 20000,
          depositCents: 5000,
          status: defaultDefaults.status,
        });
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it("resets isSubmitting to false after a failed submit", async () => {
      const { ApiError } = await import("@/lib/api");
      mockApi.mockRejectedValue(new ApiError(500, null));

      const { result } = renderHook(() => useAdminLeadForm(defaultDefaults));

      await act(async () => {
        await result.current.handleSubmit({
          priceCents: 20000,
          depositCents: 5000,
          status: defaultDefaults.status,
        });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
