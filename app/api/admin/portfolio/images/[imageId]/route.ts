export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/with-admin";
import prisma from "@/lib/prisma";
import { r2Client } from "@/lib/r2/presigned";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const DELETE = withAdmin<{ imageId: string }>(
  async (_req, { params }) => {
    const { imageId } = await params;

    const image = await prisma.portfolioImage.findUnique({
      where: { id: imageId },
      select: { id: true, r2Key: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const client = r2Client();
    await client
      .send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: image.r2Key,
        }),
      )
      .catch(() => {});

    await prisma.portfolioImage.delete({ where: { id: imageId } });

    return NextResponse.json({ ok: true });
  },
);
