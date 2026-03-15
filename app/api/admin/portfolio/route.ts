export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/with-admin";
import prisma from "@/lib/prisma";
import { PortfolioItemSchema } from "@/modules/schemas/portfolio";
import { z } from "zod";

export const GET = withAdmin(async () => {
  const items = await prisma.portfolioItem.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(items);
});

export const POST = withAdmin(async (req) => {
  const json = await req.json().catch(() => null);
  const parsed = PortfolioItemSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const item = await prisma.portfolioItem.create({
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

  return NextResponse.json(item, { status: 201 });
});
