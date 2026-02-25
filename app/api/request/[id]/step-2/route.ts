import prisma from "@/lib/prisma";
import { Step2Schema } from "@/modules/schemas/tattoo";
import { NextResponse } from "next/server";

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const json = await req.json().catch(() => null);
  const parsed = Step2Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.tattooRequest.update({
    where: { id: ctx.params.id },
    data: { specialInstructions: parsed.data.specialInstructions, status: "REFERENCES_SET" },
    select: { id: true, status: true },
  });

  return NextResponse.json(updated);
}
