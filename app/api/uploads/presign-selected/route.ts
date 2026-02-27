export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { presignPut } from "@/lib/r2/presigned";
import { PresignSelectedSchema } from "@/modules/schemas/tattoo";
import { z } from "zod";

/**
 * POST /api/uploads/presign-selected
 *
 * Issues a short-lived presigned PUT URL for the selected tattoo image.
 * The client uploads the blob directly to R2 — the binary never passes
 * through Vercel (critical for Vercel's request-body size limits).
 *
 * Assumption: any authenticated or anonymous user that has a valid
 * requestId may presign. Auth guard can be added later without changing
 * the contract.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = PresignSelectedSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { requestId, mimeType, ext } = parsed.data;

  // Key pattern: tattoos/requests/<id>/selected/<uuid>.<ext>
  // Using a UUID prevents collisions when the user regenerates and
  // re-submits without a page reload.
  const r2Key = `tattoos/requests/${requestId}/selected/${crypto.randomUUID()}.${ext}`;

  const uploadUrl = await presignPut({
    key: r2Key,
    contentType: mimeType,
    expiresInSeconds: 120, // 2 min — generous enough for large PNG exports
  });

  return NextResponse.json({ uploadUrl, r2Key });
}
