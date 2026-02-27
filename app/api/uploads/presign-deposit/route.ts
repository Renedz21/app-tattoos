export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { presignPut } from "@/lib/r2/presigned";
import { z } from "zod";

const Body = z.object({
  requestId: z.string().min(10),
  mimeType: z.string().min(3),
  ext: z.string().min(1).max(10),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { requestId, mimeType, ext } = parsed.data;

  const r2Key = `tattoos/requests/${requestId}/deposit/${crypto.randomUUID()}.${ext}`;

  const uploadUrl = await presignPut({
    key: r2Key,
    contentType: mimeType,
    expiresInSeconds: 120,
  });

  return NextResponse.json({ uploadUrl, r2Key });
}
