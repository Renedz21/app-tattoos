import { z } from "zod";

export const paymentForm = z.object({
  status: z.string().optional(),
  depositCents: z.any().optional(), //seña
  priceCents: z.any().optional(), // monto total
  quotedAt: z.date().optional(),
  depositDueAt: z.date().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentForm>;
