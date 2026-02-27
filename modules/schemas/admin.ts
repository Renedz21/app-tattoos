import { z } from "zod";
import {
  RequestStatus,
  PaymentMethod,
} from "@/lib/generated/prisma/enums";

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

export const AdminDepositConfirmSchema = z.object({
  depositAdminNote: z.string().trim().max(500).optional(),
});
export type AdminDepositConfirmInput = z.infer<typeof AdminDepositConfirmSchema>;

export const DepositSubmitProofSchema = z.object({
  depositMethod: z.enum(PaymentMethod),
  depositVerificationCode: z
    .string()
    .trim()
    .length(3, "El código debe tener exactamente 3 caracteres"),
  r2Key: z.string().min(10),
  mimeType: z.string().min(3),
  sizeBytes: z.number().int().positive(),
});
export type DepositSubmitProofInput = z.infer<typeof DepositSubmitProofSchema>;
