import { z } from "zod";
import {
  TattooStyle,
  TattooSize,
  ColorMode,
} from "@/lib/generated/prisma/enums";

export const TattooStyleSchema = z.enum(TattooStyle, {
  error: "El estilo del tatuaje es requerido",
});
export const TattooSizeSchema = z.enum(TattooSize, {
  error: "El tamaño del tatuaje es requerido",
});
export const ColorModeSchema = z.enum(ColorMode);

export const Step1Schema = z.object({
  style: TattooStyleSchema,
  bodyZone: z.string().trim().min(2, {
    message: "El área del cuerpo es requerida",
  }).max(50),
  size: TattooSizeSchema,
  colorMode: ColorModeSchema,
  detailLevel: z.number().int().min(1).max(5),
});

export const Step2Schema = z.object({
  specialInstructions: z.string().trim().min(1, {
    message: "Las instrucciones para el diseño son requeridas",
  }).max(600),
});

export const masterSchema = z.object({
  ...Step1Schema.shape,
  ...Step2Schema.shape,
});

export const stepSchemas = [Step1Schema, Step2Schema, null] as const;
export const TOTAL_STEPS = stepSchemas.length;

export type Step1Input = z.infer<typeof Step1Schema>;
export type Step2Input = z.infer<typeof Step2Schema>;
export type MasterSchemaType = z.infer<typeof masterSchema>;

export const RefineSchema = z.object({
  refineText: z.string().trim().max(400).optional(),
});
export type RefineInput = z.infer<typeof RefineSchema>;

export const PresignSelectedSchema = z.object({
  requestId: z.string().min(10),
  mimeType: z.string().min(3),
  ext: z.string().min(1).max(10),
});
export type PresignSelectedInput = z.infer<typeof PresignSelectedSchema>;

// Schema para capturar contacto antes de crear el request
export const ContactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo")
    .max(80, "Máximo 80 caracteres"),
  whatsapp: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-().]{7,20}$/,
      "Ingresa un número de WhatsApp válido (ej: +51 987 654 321)",
    ),
});
export type ContactInput = z.infer<typeof ContactSchema>;

// Schema para crear el request: Step1 + contacto
export const CreateRequestSchema = z.object({
  ...Step1Schema.shape,
  ...ContactSchema.shape,
});
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;

// QuoteForm ya no pide nombre ni WhatsApp (se capturan al inicio)
export const QuoteFormSchema = z.object({
  district: z
    .string()
    .trim()
    .min(2, "Ingresa tu distrito")
    .max(60, "Máximo 60 caracteres"),
  availability: z
    .string()
    .trim()
    .min(3, "Indica tu disponibilidad")
    .max(120, "Máximo 120 caracteres"),
  extraComments: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});
export type QuoteFormInput = z.infer<typeof QuoteFormSchema>;

export const SubmitQuoteSchema = z.object({
  ...QuoteFormSchema.shape,
  r2Key: z.string().min(10),
  mimeType: z.string().min(3),
  sizeBytes: z.number().int().positive(),
});
export type SubmitQuoteInput = z.infer<typeof SubmitQuoteSchema>;
