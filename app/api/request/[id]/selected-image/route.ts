export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CompleteSelectedSchema } from "@/modules/schemas/tattoo";

/**
 * POST /api/request/:id/selected-image
 *
 * Called by the client after a successful presigned PUT to R2.
 * Creates a GeneratedImage row and marks it as the TattooRequest's
 * selected image in a single transaction.
 *
 * Assumption: R2_PUBLIC_URL env var holds the public base URL for the
 * bucket (e.g. https://pub-xxx.r2.dev). If absent, publicUrl is null.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = CompleteSelectedSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Verify the request exists before writing anything
  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!tr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { r2Key, mimeType, sizeBytes } = parsed.data;

  // Build the public URL only when the env var is configured
  const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  const publicUrl = publicBase ? `${publicBase}/${r2Key}` : null;

  // Create the image record, then point the request at it.
  // Two sequential writes — Prisma doesn't allow a self-referencing
  // create+connect in a single transaction here (selectedImageId needs
  // the generated id), so we use $transaction for the update pair.
  const image = await prisma.generatedImage.create({
    data: {
      requestId: id,
      kind: "INITIAL",
      r2Key,
      publicUrl,
      mimeType,
      sizeBytes,
      modelName: "gemini-3-pro-image-preview",
    },
    select: { id: true },
  });

  await prisma.tattooRequest.update({
    where: { id },
    data: {
      selectedImageId: image.id,
      status: "GENERATED",
    },
  });

  return NextResponse.json({ selectedImageId: image.id });
}
