import type { PrismaClient } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

const PREFIX = "INK";
export const SUFFIX_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const SUFFIX_LENGTH = 4;
const MAX_RETRIES = 10;

export function randomSuffix(): string {
  let result = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    result += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  }
  return result;
}

export function buildCode(suffix: string): string {
  return `${PREFIX}-${suffix}`;
}

export async function generateRequestCode(
  db: Pick<PrismaClient, "tattooRequest"> = prisma,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidate = buildCode(randomSuffix());

    const existing = await db.tattooRequest.findUnique({
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
