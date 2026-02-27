export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, AdminGuardError } from "@/lib/admin-guard";
import { AdminQuoteSchema } from "@/modules/schemas/admin";
import { RequestStatus } from "@/lib/generated/prisma/enums";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }

  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = AdminQuoteSchema.safeParse(json);

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

  if (tr.status !== RequestStatus.SENT && tr.status !== RequestStatus.QUOTED) {
    return NextResponse.json(
      { error: "invalid_status", current: tr.status },
      { status: 409 },
    );
  }

  const { priceCents, depositCents, depositDueAt, currency } = parsed.data;

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: {
      priceCents,
      depositCents,
      depositDueAt: depositDueAt ? new Date(depositDueAt) : null,
      currency,
      status: RequestStatus.QUOTED,
      quotedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      priceCents: true,
      depositCents: true,
      depositDueAt: true,
      currency: true,
      quotedAt: true,
    },
  });

  return NextResponse.json(updated);
}
