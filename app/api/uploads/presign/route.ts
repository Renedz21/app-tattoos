export const runtime = "nodejs";

import { presignPut } from "@/lib/r2/presigned";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  requestId: z.string().min(10),
  fileName: z.string().min(1),
  contentType: z.string().min(3),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });

  const ext = parsed.data.fileName.split(".").pop()?.toLowerCase() || "bin";
  const key = `tattoos/requests/${parsed.data.requestId}/references/${crypto.randomUUID()}.${ext}`;

  const uploadUrl = await presignPut({
    key,
    contentType: parsed.data.contentType,
    expiresInSeconds: 60,
  });

  return NextResponse.json({ uploadUrl, r2Key: key });
}
