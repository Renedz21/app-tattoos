import prisma from "@/lib/prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const PREFIX = "ZT";

/**
 * Characters used for the random suffix.
 * Omits visually ambiguous chars: 0/O, 1/I/L.
 */
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const SUFFIX_LENGTH = 4;
const MAX_RETRIES = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomSuffix(): string {
  let result = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

function buildCode(suffix: string): string {
  return `${PREFIX}-${suffix}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * generateRequestCode
 *
 * Generates a unique, human-readable request code of the form `ZT-XXXX`
 * (e.g. "ZT-A3K7"). Uses a random suffix drawn from an unambiguous
 * alphanumeric charset, retrying up to MAX_RETRIES times on the unlikely
 * event of a collision.
 *
 * Strategy: random (not sequential) so codes are not guessable and there
 * are no gaps visible to users. With SUFFIX_LENGTH = 4 and 31 characters
 * the collision probability stays negligible (< 0.1 %) up to ~10 k records.
 *
 * Must be called inside a transaction or with a unique DB constraint so a
 * race condition between two concurrent submissions cannot produce duplicate
 * codes. The `requestCode` column has a `@unique` index in the Prisma
 * schema, so the DB will reject duplicates at the constraint level as a
 * final safety net.
 *
 * @throws Error if a unique code cannot be found within MAX_RETRIES attempts.
 */
export async function generateRequestCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidate = buildCode(randomSuffix());

    const existing = await prisma.tattooRequest.findUnique({
      where: { requestCode: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(
    `[generateRequestCode] Could not find a unique code after ${MAX_RETRIES} retries.`,
  );
}
