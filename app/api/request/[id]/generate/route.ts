import { NextResponse } from "next/server";
import { putToR2 } from "@/lib/r2/server-put"; // abajo te lo dejo
import prisma from "@/lib/prisma";
import { generateImages } from "@/lib/ai/generate-image";
import { buildTattooPrompt } from "@/lib/prompts/tattoo-prompt";
import { Step1Schema, Step2Schema } from "@/modules/schemas/tattoo";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const { n } = body;

  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    include: { referenceImages: true },
  });
  if (!tr) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const step1 = Step1Schema.parse({
    title: tr.title ?? undefined,
    style: tr.style,
    styleOther: tr.styleOther ?? undefined,
    bodyZone: tr.bodyZone,
    size: tr.size,
    sizeNotes: tr.sizeNotes ?? undefined,
    colorMode: tr.colorMode,
    detailLevel: tr.detailLevel,
  });
  const step2 = Step2Schema.parse({
    specialInstructions: tr.specialInstructions ?? undefined,
  });

  const job = await prisma.generationJob.create({
    data: {
      requestId: tr.id,
      type: "GENERATE_IMAGES",
      status: "PROCESSING",
      provider: "AI_STUDIO",
      modelName: "gemini-3-pro-image-preview",
    },
    select: { id: true },
  });

  try {
    const prompt = buildTattooPrompt(step1, step2);
    const images = await generateImages(prompt, n);

    console.log({ images });

    return NextResponse.json({ jobId: job.id, images });
  } catch (e: any) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: "ERROR", error: e?.message ?? "unknown" },
    });
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
