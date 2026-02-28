import { describe, it, expect } from "vitest";
import {
  AdminQuoteSchema,
  AdminStatusSchema,
  AdminDepositConfirmSchema,
  DepositSubmitProofSchema,
} from "@/modules/schemas/admin";
import { RequestStatus, PaymentMethod } from "@/lib/generated/prisma/enums";

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

describe("AdminDepositConfirmSchema", () => {
  it("accepts an empty object", () => {
    expect(() => AdminDepositConfirmSchema.parse({})).not.toThrow();
  });

  it("accepts a valid admin note", () => {
    const result = AdminDepositConfirmSchema.parse({
      depositAdminNote: "Verified via bank transfer",
    });
    expect(result.depositAdminNote).toBe("Verified via bank transfer");
  });

  it("trims whitespace from the note", () => {
    const result = AdminDepositConfirmSchema.parse({
      depositAdminNote: "  trimmed  ",
    });
    expect(result.depositAdminNote).toBe("trimmed");
  });

  it("rejects a note exceeding 500 characters", () => {
    expect(() =>
      AdminDepositConfirmSchema.parse({
        depositAdminNote: "a".repeat(501),
      }),
    ).toThrow();
  });

  it("accepts a note of exactly 500 characters", () => {
    expect(() =>
      AdminDepositConfirmSchema.parse({
        depositAdminNote: "a".repeat(500),
      }),
    ).not.toThrow();
  });

  it("allows depositAdminNote to be absent", () => {
    const result = AdminDepositConfirmSchema.parse({});
    expect(result.depositAdminNote).toBeUndefined();
  });
});

describe("DepositSubmitProofSchema", () => {
  const valid = {
    depositMethod: PaymentMethod.TRANSFER,
    depositVerificationCode: "A1B",
    r2Key: "tattoos/requests/abc123/proof.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 204800,
  };

  it("accepts a valid proof payload", () => {
    expect(() => DepositSubmitProofSchema.parse(valid)).not.toThrow();
  });

  it("accepts every valid PaymentMethod value", () => {
    for (const method of Object.values(PaymentMethod)) {
      expect(() =>
        DepositSubmitProofSchema.parse({ ...valid, depositMethod: method }),
      ).not.toThrow();
    }
  });

  it("rejects an unknown depositMethod", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({ ...valid, depositMethod: "CRYPTO" }),
    ).toThrow();
  });

  it("rejects a verification code shorter than 3 characters", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({
        ...valid,
        depositVerificationCode: "AB",
      }),
    ).toThrow();
  });

  it("rejects a verification code longer than 3 characters", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({
        ...valid,
        depositVerificationCode: "ABCD",
      }),
    ).toThrow();
  });

  it("accepts a verification code of exactly 3 characters", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({
        ...valid,
        depositVerificationCode: "XYZ",
      }),
    ).not.toThrow();
  });

  it("rejects r2Key shorter than 10 characters", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({ ...valid, r2Key: "short" }),
    ).toThrow();
  });

  it("rejects mimeType shorter than 3 characters", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({ ...valid, mimeType: "im" }),
    ).toThrow();
  });

  it("rejects sizeBytes of zero", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({ ...valid, sizeBytes: 0 }),
    ).toThrow();
  });

  it("rejects negative sizeBytes", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({ ...valid, sizeBytes: -1 }),
    ).toThrow();
  });

  it("rejects non-integer sizeBytes", () => {
    expect(() =>
      DepositSubmitProofSchema.parse({ ...valid, sizeBytes: 1024.5 }),
    ).toThrow();
  });

  it("rejects when required fields are missing", () => {
    expect(() => DepositSubmitProofSchema.parse({})).toThrow();
  });
});
