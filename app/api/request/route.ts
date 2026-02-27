import prisma from "@/lib/prisma";
import { Step1Schema } from "@/modules/schemas/tattoo";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Step1Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const r = await prisma.tattooRequest.create({
    data: parsed.data,
    select: { id: true, trackingToken: true, status: true },
  });

  return NextResponse.json(r, { status: 201 });
}
