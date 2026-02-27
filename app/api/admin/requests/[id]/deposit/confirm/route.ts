export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, AdminGuardError } from "@/lib/admin-guard";
import { AdminDepositConfirmSchema } from "@/modules/schemas/admin";
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
  const parsed = AdminDepositConfirmSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const tr = await prisma.tattooRequest.findUnique({
    where: { id },
    select: { id: true, status: true, depositSubmittedAt: true },
  });

  if (!tr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (tr.status !== RequestStatus.DEPOSIT_PENDING) {
    return NextResponse.json(
      { error: "invalid_status", current: tr.status },
      { status: 409 },
    );
  }

  if (!tr.depositSubmittedAt) {
    return NextResponse.json(
      { error: "no_deposit_submitted" },
      { status: 409 },
    );
  }

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: {
      depositConfirmedAt: new Date(),
      depositAdminNote: parsed.data.depositAdminNote?.trim() ?? null,
      status: RequestStatus.APPOINTMENT_CONFIRMED,
    },
    select: {
      id: true,
      status: true,
      depositConfirmedAt: true,
      depositAdminNote: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}
