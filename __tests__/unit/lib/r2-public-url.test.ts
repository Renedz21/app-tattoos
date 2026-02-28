import { describe, it, expect, afterEach } from "vitest";
import { buildR2PublicUrl } from "@/lib/r2/public-url";

describe("buildR2PublicUrl", () => {
  const original = process.env.R2_PUBLIC_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.R2_PUBLIC_URL;
    } else {
      process.env.R2_PUBLIC_URL = original;
    }
  });

  it("returns null when R2_PUBLIC_URL is not set", () => {
    delete process.env.R2_PUBLIC_URL;
    expect(buildR2PublicUrl("tattoos/requests/abc.png")).toBeNull();
  });

  it("returns null when R2_PUBLIC_URL is an empty string", () => {
    process.env.R2_PUBLIC_URL = "";
    expect(buildR2PublicUrl("tattoos/requests/abc.png")).toBeNull();
  });

  it("returns the full URL by joining base and key with a slash", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    expect(buildR2PublicUrl("tattoos/requests/abc.png")).toBe(
      "https://cdn.example.com/tattoos/requests/abc.png",
    );
  });

  it("strips a trailing slash from the base URL before joining", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com/";
    expect(buildR2PublicUrl("tattoos/requests/abc.png")).toBe(
      "https://cdn.example.com/tattoos/requests/abc.png",
    );
  });

  it("strips multiple trailing slashes from the base URL", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com///";
    expect(buildR2PublicUrl("tattoos/requests/abc.png")).toBe(
      "https://cdn.example.com/tattoos/requests/abc.png",
    );
  });

  it("works with a key that starts with a slash", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    expect(buildR2PublicUrl("/tattoos/requests/abc.png")).toBe(
      "https://cdn.example.com//tattoos/requests/abc.png",
    );
  });

  it("works with a nested key path", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    expect(buildR2PublicUrl("a/b/c/d/image.webp")).toBe(
      "https://cdn.example.com/a/b/c/d/image.webp",
    );
  });

  it("works with a flat key (no subdirectory)", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    expect(buildR2PublicUrl("image.png")).toBe(
      "https://cdn.example.com/image.png",
    );
  });

  it("works with a base URL that has a path prefix", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com/assets";
    expect(buildR2PublicUrl("tattoos/abc.png")).toBe(
      "https://cdn.example.com/assets/tattoos/abc.png",
    );
  });

  it("preserves query strings or special characters in the key", () => {
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    expect(buildR2PublicUrl("tattoos/my file (1).png")).toBe(
      "https://cdn.example.com/tattoos/my file (1).png",
    );
  });
});
