import { z } from "zod";
import { TattooStyle, ColorMode } from "@/lib/generated/prisma/enums";

export const PortfolioItemSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120),
  style: z.nativeEnum(TattooStyle),
  bodyZone: z.string().max(100),
  colorMode: z.nativeEnum(ColorMode),
  description: z.string().max(500),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type PortfolioItemInput = z.infer<typeof PortfolioItemSchema>;
