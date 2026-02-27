import prisma from "@/lib/prisma";
import { Step2Schema } from "@/modules/schemas/tattoo";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = Step2Schema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: {
      specialInstructions: parsed.data.specialInstructions,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json(updated);
}
