/**
 * Builds the public URL for an R2 object key.
 *
 * Reads R2_PUBLIC_URL from env and appends the key.
 * Returns null when the env variable is not set (e.g. local dev without CDN).
 *
 * Usage:
 *   const publicUrl = buildR2PublicUrl(r2Key); // "https://cdn.example.com/tattoos/requests/..."
 */
export function buildR2PublicUrl(r2Key: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/${r2Key}`;
}
