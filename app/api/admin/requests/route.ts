export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, AdminGuardError } from "@/lib/admin-guard";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status ? { status: status as any } : { status: { not: null } };

  const [requests, counts] = await Promise.all([
    prisma.tattooRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        requestCode: true,
        trackingToken: true,
        status: true,
        fullName: true,
        whatsappE164: true,
        district: true,
        style: true,
        bodyZone: true,
        size: true,
        colorMode: true,
        selectedImagePublicUrl: true,
        priceCents: true,
        depositCents: true,
        currency: true,
        depositDueAt: true,
        depositMethod: true,
        depositVerificationCode: true,
        depositProofPublicUrl: true,
        depositSubmittedAt: true,
        depositConfirmedAt: true,
        sentAt: true,
        quotedAt: true,
        appointmentAt: true,
        finishedAt: true,
        expiredAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.tattooRequest.groupBy({
      by: ["status"],
      where: { status: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of counts) {
    if (row.status) {
      statusCounts[row.status] = row._count._all;
    }
  }

  return NextResponse.json({ requests, statusCounts });
}
