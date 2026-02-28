import { describe, it, expect } from "vitest";
import {
  AdminQuoteSchema,
  AdminStatusSchema,
} from "@/modules/schemas/admin";
import { RequestStatus } from "@/lib/generated/prisma/enums";

describe("AdminQuoteSchema", () => {
  const valid = {
    priceCents: 15000,
    depositCents: 5000,
    currency: "PEN",
  };

  it("accepts a valid quote payload", () => {
    expect(() => AdminQuoteSchema.parse(valid)).not.toThrow();
  });

  it("rejects priceCents of zero", () => {
    expect(() => AdminQuoteSchema.parse({ ...valid, priceCents: 0 })).toThrow();
  });

  it("rejects negative priceCents", () => {
    expect(() =>
      AdminQuoteSchema.parse({ ...valid, priceCents: -100 }),
    ).toThrow();
  });

  it("rejects depositCents of zero", () => {
    expect(() =>
      AdminQuoteSchema.parse({ ...valid, depositCents: 0 }),
    ).toThrow();
  });

  it("rejects non-integer priceCents", () => {
    expect(() =>
      AdminQuoteSchema.parse({ ...valid, priceCents: 150.5 }),
    ).toThrow();
  });

  it("rejects non-integer depositCents", () => {
    expect(() =>
      AdminQuoteSchema.parse({ ...valid, depositCents: 50.99 }),
    ).toThrow();
  });

  it("defaults currency to 'PEN' when omitted", () => {
    const { currency: _, ...withoutCurrency } = valid;
    const result = AdminQuoteSchema.parse(withoutCurrency);
    expect(result.currency).toBe("PEN");
  });

  it("accepts an optional depositDueAt ISO datetime string", () => {
    const result = AdminQuoteSchema.parse({
      ...valid,
      depositDueAt: "2025-12-31T23:59:59.000Z",
    });
    expect(result.depositDueAt).toBe("2025-12-31T23:59:59.000Z");
  });

  it("rejects depositDueAt that is not a datetime string", () => {
    expect(() =>
      AdminQuoteSchema.parse({ ...valid, depositDueAt: "not-a-date" }),
    ).toThrow();
  });

  it("allows depositDueAt to be absent", () => {
    const result = AdminQuoteSchema.parse(valid);
    expect(result.depositDueAt).toBeUndefined();
  });
});

describe("AdminStatusSchema", () => {
  it("accepts a valid status", () => {
    expect(() =>
      AdminStatusSchema.parse({ status: RequestStatus.QUOTED }),
    ).not.toThrow();
  });

  it("accepts every valid RequestStatus value", () => {
    for (const status of Object.values(RequestStatus)) {
      expect(() => AdminStatusSchema.parse({ status })).not.toThrow();
    }
  });

  it("rejects an unknown status string", () => {
    expect(() =>
      AdminStatusSchema.parse({ status: "INVALID_STATUS" }),
    ).toThrow();
  });

  it("rejects when status is missing", () => {
    expect(() => AdminStatusSchema.parse({})).toThrow();
  });

  it("accepts a valid appointmentAt ISO datetime string", () => {
    const result = AdminStatusSchema.parse({
      status: RequestStatus.APPOINTMENT_CONFIRMED,
      appointmentAt: "2025-08-15T10:00:00.000Z",
    });
    expect(result.appointmentAt).toBe("2025-08-15T10:00:00.000Z");
  });

  it("rejects appointmentAt that is not a datetime string", () => {
    expect(() =>
      AdminStatusSchema.parse({
        status: RequestStatus.APPOINTMENT_CONFIRMED,
        appointmentAt: "next monday",
      }),
    ).toThrow();
  });

  it("allows appointmentAt to be absent", () => {
    const result = AdminStatusSchema.parse({ status: RequestStatus.SENT });
    expect(result.appointmentAt).toBeUndefined();
  });
});
