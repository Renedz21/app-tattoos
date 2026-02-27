export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRequestCode } from "@/lib/request-code";
import { SubmitQuoteSchema } from "@/modules/schemas/tattoo";

/**
 * POST /api/request/:id/submit-quote
 *
 * Final step of the wizard. Called by the client after:
 *   1. The user has selected a generated preview.
 *   2. The image blob has been PUT directly to R2 via a presigned URL.
 *   3. The user has filled in the quote contact form.
 *
 * This endpoint:
 *   a. Validates the full payload (contact fields + image metadata).
 *   b. Verifies the TattooRequest exists and is not already submitted.
 *   c. Creates a GeneratedImage row with the R2 key.
 *   d. Generates a unique human-readable requestCode (ZT-XXXX).
 *   e. Updates TattooRequest in a single transaction:
 *        - links selectedImageId
 *        - saves contact fields (fullName, whatsappE164, district, availability, extraComments)
 *        - sets status → SENT and sentAt → now
 *        - sets requestCode
 *   f. Returns { requestCode, trackingToken } to the client.
 *
 * Assumption: the binary never passes through this endpoint — it was
 * uploaded directly to R2 by the client using the presigned PUT URL from
 * POST /api/uploads/presign-selected.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // ── Parse + validate body ──────────────────────────────────────────────────
  const json = await req.json().catch(() => null);
  const parsed = SubmitQuoteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    fullName,
    whatsapp,
    district,
    availability,
    extraComments,
    r2Key,
    mimeType,
    sizeBytes,
  } = parsed.data;

  // ── Verify request exists and is in a submittable state ───────────────────
  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: { id: true, status: true, trackingToken: true },
  });

  if (!tr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (tr.status === "SENT" || tr.status === "QUOTED") {
    return NextResponse.json(
      { error: "already_submitted" },
      { status: 409 },
    );
  }

  // ── Build public URL (only when R2_PUBLIC_URL is configured) ──────────────
  const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  const publicUrl = publicBase ? `${publicBase}/${r2Key}` : null;

  // ── Generate unique requestCode (ZT-XXXX) ────────────────────────────────
  let requestCode: string;
  try {
    requestCode = await generateRequestCode();
  } catch (err) {
    console.error("[submit-quote] requestCode generation failed:", err);
    return NextResponse.json(
      { error: "code_generation_failed" },
      { status: 500 },
    );
  }

  // ── Persist everything in a transaction ───────────────────────────────────
  // Two sequential writes are needed because GeneratedImage.id is needed to
  // set TattooRequest.selectedImageId. We wrap them in $transaction so both
  // succeed or both roll back.
  const { trackingToken } = await prisma.$transaction(async (tx) => {
    // 1. Create the GeneratedImage record
    const image = await tx.generatedImage.create({
      data: {
        requestId: id,
        kind: "INITIAL",
        r2Key,
        publicUrl,
        mimeType,
        sizeBytes,
        modelName: "gemini-2.0-flash-preview-image-generation",
      },
      select: { id: true },
    });

    // 2. Update TattooRequest with all submission data
    const updated = await tx.tattooRequest.update({
      where: { id },
      data: {
        requestCode,
        selectedImageId: image.id,
        fullName: fullName.trim(),
        // Normalise whatsapp: strip spaces/dashes so we store a clean E.164-ish string
        whatsappE164: whatsapp.replace(/[\s\-().]/g, ""),
        district: district.trim(),
        availability: availability.trim(),
        extraComments: extraComments?.trim() ?? null,
        status: "SENT",
        sentAt: new Date(),
      },
      select: { trackingToken: true },
    });

    return updated;
  });

  // ── Respond ───────────────────────────────────────────────────────────────
  return NextResponse.json({ requestCode, trackingToken }, { status: 201 });
}
