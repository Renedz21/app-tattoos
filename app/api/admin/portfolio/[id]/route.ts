export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/with-admin";
import prisma from "@/lib/prisma";
import { PortfolioItemSchema } from "@/modules/schemas/portfolio";
import { z } from "zod";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2/presigned";

export const PUT = withAdmin<{ id: string }>(async (req, { params }) => {
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PortfolioItemSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const item = await prisma.portfolioItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      style: parsed.data.style,
      bodyZone: parsed.data.bodyZone || null,
      colorMode: parsed.data.colorMode,
      description: parsed.data.description || null,
      isPublished: parsed.data.isPublished,
      sortOrder: parsed.data.sortOrder,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(item);
});

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const { id } = await params;

  const images = await prisma.portfolioImage.findMany({
    where: { itemId: id },
    select: { r2Key: true },
  });

  const client = r2Client();
  const bucket = process.env.R2_BUCKET!;

  await Promise.all(
    images.map((img) =>
      client
        .send(new DeleteObjectCommand({ Bucket: bucket, Key: img.r2Key }))
        .catch(() => {}),
    ),
  );

  await prisma.portfolioItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
});
