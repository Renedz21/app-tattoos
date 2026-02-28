import { describe, it, expect } from "vitest";
import { formatBytes } from "@/modules/hooks/use-file-upload";
import { dataUrlToBlob } from "@/modules/core/generator/hooks/use-r2-presigned-upload";

describe("formatBytes", () => {
  it("returns '0 Bytes' for 0", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats bytes under 1 KB as Bytes", () => {
    expect(formatBytes(512)).toBe("512.00 Bytes");
  });

  it("formats exactly 1 KB", () => {
    expect(formatBytes(1024)).toBe("1.00 KB");
  });

  it("formats exactly 1 MB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
  });

  it("formats exactly 1 GB", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.00 GB");
  });

  it("formats exactly 1 TB", () => {
    expect(formatBytes(1024 ** 4)).toBe("1.00 TB");
  });

  it("respects the decimals parameter", () => {
    expect(formatBytes(1536, 0)).toBe("2 KB");
    expect(formatBytes(1536, 1)).toBe("1.5 KB");
    expect(formatBytes(1536, 3)).toBe("1.500 KB");
  });

  it("clamps negative decimals to 0", () => {
    expect(formatBytes(1024, -2)).toBe("1 KB");
  });

  it("formats a fractional KB value correctly", () => {
    expect(formatBytes(1536)).toBe("1.50 KB");
  });

  it("formats a value just below 1 MB correctly", () => {
    expect(formatBytes(1023 * 1024)).toBe("1023.00 KB");
  });

  it("uses default 2 decimals when not specified", () => {
    const result = formatBytes(2048);
    expect(result).toBe("2.00 KB");
  });
});

describe("dataUrlToBlob", () => {
  function makeDataUrl(content: string, mimeType: string): string {
    const base64 = btoa(content);
    return `data:${mimeType};base64,${base64}`;
  }

  it("returns a Blob instance", () => {
    const dataUrl = makeDataUrl("hello", "image/png");
    expect(dataUrlToBlob(dataUrl)).toBeInstanceOf(Blob);
  });

  it("sets the MIME type from the data URL header", () => {
    const dataUrl = makeDataUrl("hello", "image/jpeg");
    const blob = dataUrlToBlob(dataUrl);
    expect(blob.type).toBe("image/jpeg");
  });

  it("defaults to image/png when MIME type cannot be parsed", () => {
    const blob = dataUrlToBlob("data:;base64," + btoa("hello"));
    expect(blob.type).toBe("image/png");
  });

  it("produces a blob with the correct byte length", () => {
    const content = "hello world";
    const dataUrl = makeDataUrl(content, "text/plain");
    const blob = dataUrlToBlob(dataUrl);
    expect(blob.size).toBe(content.length);
  });

  it("round-trips binary content correctly", async () => {
    const content = "test content 123";
    const dataUrl = makeDataUrl(content, "image/png");
    const blob = dataUrlToBlob(dataUrl);
    const text = await blob.text();
    expect(text).toBe(content);
  });

  it("handles an empty content string", () => {
    const dataUrl = makeDataUrl("", "image/png");
    const blob = dataUrlToBlob(dataUrl);
    expect(blob.size).toBe(0);
  });

  it("handles image/webp MIME type", () => {
    const dataUrl = makeDataUrl("webp-data", "image/webp");
    const blob = dataUrlToBlob(dataUrl);
    expect(blob.type).toBe("image/webp");
  });

  it("handles application/octet-stream MIME type", () => {
    const dataUrl = makeDataUrl("binary", "application/octet-stream");
    const blob = dataUrlToBlob(dataUrl);
    expect(blob.type).toBe("application/octet-stream");
  });
});
