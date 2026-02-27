import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().min(2).max(255),
  password: z.string().min(8).max(255),
});

export type LoginSchema = z.infer<typeof loginSchema>;
