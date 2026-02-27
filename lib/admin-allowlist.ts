function getAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return false;

  const allowlist = getAllowlist();
  if (allowlist.length === 0) return false;

  return allowlist.includes(normalised);
}
