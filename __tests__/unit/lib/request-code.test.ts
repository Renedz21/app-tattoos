import { describe, it, expect, vi } from "vitest";
import {
  SUFFIX_CHARS,
  SUFFIX_LENGTH,
  randomSuffix,
  buildCode,
  generateRequestCode,
} from "@/lib/request-code";

describe("randomSuffix", () => {
  it("returns a string of the correct length", () => {
    expect(randomSuffix()).toHaveLength(SUFFIX_LENGTH);
  });

  it("only contains characters from SUFFIX_CHARS", () => {
    for (let i = 0; i < 50; i++) {
      const suffix = randomSuffix();
      for (const char of suffix) {
        expect(SUFFIX_CHARS).toContain(char);
      }
    }
  });

  it("produces different values across calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => randomSuffix()));
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("buildCode", () => {
  it("prefixes the suffix with 'ZT-'", () => {
    expect(buildCode("AB12")).toBe("ZT-AB12");
  });

  it("preserves the exact suffix passed", () => {
    const suffix = "XYZW";
    expect(buildCode(suffix)).toContain(suffix);
  });

  it("returns a string matching the expected pattern", () => {
    const code = buildCode("A2B3");
    expect(code).toMatch(/^ZT-[A-Z0-9]{4}$/);
  });

  it("handles arbitrary suffix values", () => {
    expect(buildCode("")).toBe("ZT-");
    expect(buildCode("LONGERSUFFIX")).toBe("ZT-LONGERSUFFIX");
  });
});

describe("generateRequestCode", () => {
  it("returns a code in ZT-XXXX format", async () => {
    const mockDb = {
      tattooRequest: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    const code = await generateRequestCode(mockDb as never);
    expect(code).toMatch(/^ZT-[A-Z0-9]{4}$/);
  });

  it("calls findUnique with requestCode to check uniqueness", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const mockDb = { tattooRequest: { findUnique } };

    await generateRequestCode(mockDb as never);

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ requestCode: expect.stringMatching(/^ZT-/) }),
        select: { id: true },
      }),
    );
  });

  it("retries when a collision is found and returns the next unique code", async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({ id: "existing-id" })
      .mockResolvedValueOnce({ id: "existing-id" })
      .mockResolvedValue(null);

    const mockDb = { tattooRequest: { findUnique } };

    const code = await generateRequestCode(mockDb as never);

    expect(findUnique).toHaveBeenCalledTimes(3);
    expect(code).toMatch(/^ZT-[A-Z0-9]{4}$/);
  });

  it("throws after MAX_RETRIES consecutive collisions", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: "always-exists" });
    const mockDb = { tattooRequest: { findUnique } };

    await expect(generateRequestCode(mockDb as never)).rejects.toThrow(
      /Could not find a unique code/,
    );
  });

  it("calls findUnique exactly once when the first candidate is unique", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const mockDb = { tattooRequest: { findUnique } };

    await generateRequestCode(mockDb as never);

    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it("returns different codes across independent calls", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const mockDb = { tattooRequest: { findUnique } };

    const codes = await Promise.all(
      Array.from({ length: 10 }, () => generateRequestCode(mockDb as never)),
    );

    const unique = new Set(codes);
    expect(unique.size).toBeGreaterThan(1);
  });
});
