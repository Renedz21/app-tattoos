// ─── Admin Email Allowlist ────────────────────────────────────────────────────
//
// Controls which emails are allowed to access the /admin panel.
//
// Configuration:
//   Set the env var ADMIN_EMAIL_ALLOWLIST as a comma-separated list:
//   ADMIN_EMAIL_ALLOWLIST="alice@example.com,bob@example.com"
//
// Rules:
//   - Matching is case-insensitive and whitespace-tolerant.
//   - If the env var is missing or empty, NO email is allowed (fail-closed).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the parsed, normalised allowlist from the environment variable.
 * Normalisation: trim + lowercase each entry, drop empty strings.
 */
function getAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns `true` when `email` is present in the admin allowlist defined by
 * the `ADMIN_EMAIL_ALLOWLIST` environment variable.
 *
 * Fail-closed: if the env var is not set or is empty, every email is rejected.
 *
 * @example
 * // ADMIN_EMAIL_ALLOWLIST="alice@ink.com, bob@ink.com"
 * isAdminEmail("Alice@Ink.Com") // → true
 * isAdminEmail("stranger@x.com") // → false
 */
export function isAdminEmail(email: string): boolean {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return false;

  const allowlist = getAllowlist();
  if (allowlist.length === 0) return false;

  return allowlist.includes(normalised);
}
