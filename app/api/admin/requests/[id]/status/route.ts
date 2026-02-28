export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdmin } from "@/lib/with-admin";
import { AdminStatusSchema } from "@/modules/schemas/admin";
import { RequestStatus } from "@/lib/generated/prisma/enums";

const VALID_TRANSITIONS: Record<string, RequestStatus[]> = {
  [RequestStatus.SENT]: [RequestStatus.QUOTED, RequestStatus.EXPIRED],
  [RequestStatus.QUOTED]: [
    RequestStatus.APPOINTMENT_CONFIRMED,
    RequestStatus.EXPIRED,
  ],
  [RequestStatus.APPOINTMENT_CONFIRMED]: [
    RequestStatus.FINISHED,
    RequestStatus.EXPIRED,
  ],
};

export const POST = withAdmin<{ id: string }>(async (req, { params }) => {
  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = AdminStatusSchema.safeParse(json);

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

  const current = tr.status ?? "";
  const allowed = VALID_TRANSITIONS[current] ?? [];
  const target = parsed.data.status;

  if (!allowed.includes(target as RequestStatus)) {
    return NextResponse.json(
      {
        error: "invalid_transition",
        current: tr.status,
        target,
        allowed,
      },
      { status: 409 },
    );
  }

  const now = new Date();
  const timestampMap: Record<string, Record<string, Date>> = {
    [RequestStatus.QUOTED]: { quotedAt: now },
    [RequestStatus.APPOINTMENT_CONFIRMED]: {
      depositConfirmedAt: now,
      appointmentAt: parsed.data.appointmentAt
        ? new Date(parsed.data.appointmentAt)
        : now,
    },
    [RequestStatus.FINISHED]: { finishedAt: now },
    [RequestStatus.EXPIRED]: { expiredAt: now },
  };

  const updated = await prisma.tattooRequest.update({
    where: { id },
    data: {
      status: target as RequestStatus,
      ...timestampMap[target],
    },
    select: {
      id: true,
      status: true,
      quotedAt: true,
      depositConfirmedAt: true,
      appointmentAt: true,
      finishedAt: true,
      expiredAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
});
