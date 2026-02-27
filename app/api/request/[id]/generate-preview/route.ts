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

/**
 * POST /api/request/:id/generate-preview
 *
 * Reads Step1+Step2 data from DB, builds the final prompt (+ optional
 * refineText from body), calls Gemini via AI SDK, and returns the image
 * as a base64 dataUrl.
 *
 * Nothing is saved to DB or R2 here — the preview lives only in the
 * client until the user explicitly clicks "Enviar a cotización".
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Parse optional refineText — missing body is fine, default to {}
  const json = await req.json().catch(() => ({}));
  const bodyResult = RefineSchema.safeParse(json);
  if (!bodyResult.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Load the request from DB (only the fields we need)
  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: {
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

  // Re-parse DB values through the Zod schemas so buildTattooPrompt gets
  // the exact types it expects (enums, optional fields, etc.)
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

  // Build base prompt, then append refineText when provided
  let prompt = buildTattooPrompt(step1, step2);
  console.log({ prompt });
  const { refineText } = bodyResult.data;
  if (refineText) {
    prompt += `\nRefinement instruction: ${refineText}`;
  }

  try {
    const uint8 = await generateImages(prompt, 1);

    // Convert raw bytes → base64 dataUrl so the browser can render it
    // directly without a round-trip to R2.
    const base64 = Buffer.from(uint8).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ dataUrl, mimeType: "image/png" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[generate-preview] AI generation failed:", message);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
