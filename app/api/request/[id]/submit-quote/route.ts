import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRequestCode } from "@/lib/request-code";
import { buildR2PublicUrl } from "@/lib/r2/public-url";
import { SubmitQuoteSchema } from "@/modules/schemas/tattoo";
import { RequestStatus } from "@/lib/generated/prisma/enums";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = SubmitQuoteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { district, availability, extraComments, r2Key, mimeType, sizeBytes } =
    parsed.data;

  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: { id: true, status: true, trackingToken: true, whatsappE164: true },
  });

  if (!tr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (tr.status === RequestStatus.SENT || tr.status === RequestStatus.QUOTED) {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  // Guard para requests legacy sin WhatsApp (creados antes de este cambio)
  if (!tr.whatsappE164) {
    return NextResponse.json({ error: "whatsapp_required" }, { status: 422 });
  }

  const publicUrl = buildR2PublicUrl(r2Key);

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

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: {
      requestCode,
      selectedImageR2Key: r2Key,
      selectedImagePublicUrl: publicUrl,
      selectedImageMimeType: mimeType,
      selectedImageSizeBytes: sizeBytes,
      district: district.trim(),
      availability: availability.trim(),
      extraComments: extraComments?.trim() ?? null,
      status: RequestStatus.SENT,
      sentAt: new Date(),
    },
    select: { trackingToken: true },
  });

  return NextResponse.json(
    { requestCode, trackingToken: updated.trackingToken },
    { status: 201 },
  );
}
