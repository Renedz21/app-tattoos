export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/with-admin";
import prisma from "@/lib/prisma";
import { r2Client } from "@/lib/r2/presigned";
import { buildR2PublicUrl } from "@/lib/r2/public-url";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

export const POST = withAdmin(async (req) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const itemId = formData.get("itemId") as string | null;

  if (!file || !itemId) {
    return NextResponse.json(
      { error: "file and itemId are required" },
      { status: 400 },
    );
  }

  const exists = await prisma.portfolioItem.findUnique({
    where: { id: itemId },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json(
      { error: "PortfolioItem not found" },
      { status: 404 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const webpBuffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const imageId = crypto.randomUUID();
  const r2Key = `portfolio/${itemId}/${imageId}.webp`;

  const client = r2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: r2Key,
      Body: webpBuffer,
      ContentType: "image/webp",
    }),
  );

  const publicUrl = buildR2PublicUrl(r2Key);

  const image = await prisma.portfolioImage.create({
    data: {
      itemId,
      r2Key,
      publicUrl,
      mimeType: "image/webp",
      sizeBytes: webpBuffer.length,
    },
  });

  return NextResponse.json(image, { status: 201 });
});
