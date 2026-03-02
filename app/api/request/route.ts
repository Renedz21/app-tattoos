import prisma from "@/lib/prisma";
import { CreateRequestSchema } from "@/modules/schemas/tattoo";
import { NextResponse } from "next/server";
import { RequestStatus } from "@/lib/generated/prisma/enums";

function normalizeWhatsapp(raw: string): string {
  return raw.replace(/[\s\-().]/g, "");
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, whatsapp, ...step1 } = parsed.data;
  const whatsappE164 = normalizeWhatsapp(whatsapp);

  // Buscar request activo con ese WhatsApp (status distinto de FINISHED/EXPIRED)
  const existing = await prisma.tattooRequest.findFirst({
    where: {
      whatsappE164,
      OR: [
        { status: null },
        { status: { notIn: [RequestStatus.FINISHED, RequestStatus.EXPIRED] } },
      ],
    },
    select: { id: true, trackingToken: true },
  });

  if (existing) {
    // Actualizar datos del Step1 y continuar con el request existente
    await prisma.tattooRequest.update({
      where: { id: existing.id },
      data: { ...step1, fullName: fullName.trim() },
    });
    return NextResponse.json({
      id: existing.id,
      trackingToken: existing.trackingToken,
      isExisting: true,
    });
  }

  const r = await prisma.tattooRequest.create({
    data: { ...step1, fullName: fullName.trim(), whatsappE164 },
    select: { id: true, trackingToken: true },
  });

  return NextResponse.json(
    { id: r.id, trackingToken: r.trackingToken, isExisting: false },
    { status: 201 },
  );
}
