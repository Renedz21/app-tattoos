export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DepositSubmitProofSchema } from "@/modules/schemas/admin";
import { RequestStatus } from "@/lib/generated/prisma/enums";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = DepositSubmitProofSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!tr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (tr.status !== RequestStatus.QUOTED && tr.status !== RequestStatus.DEPOSIT_PENDING) {
    return NextResponse.json(
      { error: "invalid_status", current: tr.status },
      { status: 409 },
    );
  }

  const { depositMethod, depositVerificationCode, r2Key, mimeType, sizeBytes } =
    parsed.data;

  const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  const publicUrl = publicBase ? `${publicBase}/${r2Key}` : null;

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: {
      depositMethod,
      depositVerificationCode,
      depositProofR2Key: r2Key,
      depositProofPublicUrl: publicUrl,
      depositProofMimeType: mimeType,
      depositProofSizeBytes: sizeBytes,
      depositSubmittedAt: new Date(),
      status: RequestStatus.DEPOSIT_PENDING,
    },
    select: {
      id: true,
      status: true,
      depositMethod: true,
      depositVerificationCode: true,
      depositProofPublicUrl: true,
      depositSubmittedAt: true,
    },
  });

  return NextResponse.json(updated);
}
