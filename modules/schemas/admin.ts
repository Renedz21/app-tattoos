import { z } from "zod";
import { RequestStatus } from "@/lib/generated/prisma/enums";

export const AdminQuoteSchema = z.object({
  priceCents: z.number().int().positive(),
  depositCents: z.number().int().positive(),
  depositDueAt: z.string().datetime().optional(),
  currency: z.string().default("PEN"),
});
export type AdminQuoteInput = z.infer<typeof AdminQuoteSchema>;

export const AdminStatusSchema = z.object({
  status: z.enum(RequestStatus),
  appointmentAt: z.string().datetime().optional(),
});
export type AdminStatusInput = z.infer<typeof AdminStatusSchema>;
