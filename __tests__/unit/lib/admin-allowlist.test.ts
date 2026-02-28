import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAdminEmail } from "@/lib/admin-allowlist";

describe("isAdminEmail", () => {
  const original = process.env.ADMIN_EMAIL_ALLOWLIST;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ADMIN_EMAIL_ALLOWLIST;
    } else {
      process.env.ADMIN_EMAIL_ALLOWLIST = original;
    }
  });

  it("returns false when env is not set", () => {
    delete process.env.ADMIN_EMAIL_ALLOWLIST;
    expect(isAdminEmail("admin@test.com")).toBe(false);
  });

  it("returns false when env is empty string", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "";
    expect(isAdminEmail("admin@test.com")).toBe(false);
  });

  it("returns true for an exact match", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com";
    expect(isAdminEmail("admin@test.com")).toBe(true);
  });

  it("returns true when email is in a comma-separated list", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "first@test.com,admin@test.com,other@test.com";
    expect(isAdminEmail("admin@test.com")).toBe(true);
  });

  it("returns false when email is not in the list", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com,other@test.com";
    expect(isAdminEmail("hacker@evil.com")).toBe(false);
  });

  it("is case-insensitive for the input email", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com";
    expect(isAdminEmail("ADMIN@TEST.COM")).toBe(true);
  });

  it("is case-insensitive for the allowlist entry", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "ADMIN@TEST.COM";
    expect(isAdminEmail("admin@test.com")).toBe(true);
  });

  it("trims whitespace around entries in the allowlist", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "  admin@test.com  ,  other@test.com  ";
    expect(isAdminEmail("admin@test.com")).toBe(true);
    expect(isAdminEmail("other@test.com")).toBe(true);
  });

  it("trims whitespace from the input email", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com";
    expect(isAdminEmail("  admin@test.com  ")).toBe(true);
  });

  it("returns false for an empty string input", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com";
    expect(isAdminEmail("")).toBe(false);
  });

  it("returns false for a whitespace-only input", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com";
    expect(isAdminEmail("   ")).toBe(false);
  });

  it("ignores empty entries from extra commas in allowlist", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@test.com,,other@test.com";
    expect(isAdminEmail("admin@test.com")).toBe(true);
    expect(isAdminEmail("")).toBe(false);
  });

  it("handles a single-entry allowlist correctly", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "solo@test.com";
    expect(isAdminEmail("solo@test.com")).toBe(true);
    expect(isAdminEmail("other@test.com")).toBe(false);
  });
});
