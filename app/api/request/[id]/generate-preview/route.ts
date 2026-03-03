export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateImages } from "@/lib/ai/generate-image";
import { buildTattooPrompt } from "@/lib/prompts/tattoo-prompt";
import {
  RefineSchema,
  Step1Schema,
  Step2Schema,
} from "@/modules/schemas/tattoo";

const GENERATION_LIMIT = 2;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const json = await req.json().catch(() => ({}));
  const bodyResult = RefineSchema.safeParse(json);
  if (!bodyResult.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: {
      generationCount: true,
      title: true,
      style: true,
      styleOther: true,
      bodyZone: true,
      size: true,
      sizeNotes: true,
      colorMode: true,
      detailLevel: true,
      specialInstructions: true,
    },
  });

  if (!tr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (tr.generationCount >= GENERATION_LIMIT) {
    return NextResponse.json(
      {
        error: "generation_limit_reached",
        message:
          "Alcanzaste el límite de 2 diseños para esta solicitud. Escríbenos por WhatsApp para continuar.",
      },
      { status: 403 },
    );
  }

  const step1 = Step1Schema.parse({
    title: tr.title ?? undefined,
    style: tr.style,
    bodyZone: tr.bodyZone,
    size: tr.size,
    sizeNotes: tr.sizeNotes ?? undefined,
    colorMode: tr.colorMode,
    detailLevel: tr.detailLevel,
  });

  const step2 = Step2Schema.parse({
    specialInstructions: tr.specialInstructions ?? undefined,
  });

  let prompt = buildTattooPrompt(step1, step2);
  const { refineText } = bodyResult.data;
  if (refineText) {
    prompt += `\nRefinement instruction: ${refineText}`;
  }

  try {
    const uint8 = await generateImages(prompt);

    // Incrementar el contador de generaciones
    await prisma.tattooRequest.update({
      where: { id },
      data: { generationCount: { increment: 1 } },
    });

    const base64 = Buffer.from(uint8).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ dataUrl, mimeType: "image/png" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[generate-preview] AI generation failed:", message);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
