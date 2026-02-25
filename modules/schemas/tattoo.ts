import { z } from "zod";

export const TattooStyleSchema = z.enum([
  "FINE_LINE", "BLACKWORK", "REALISM", "TRADITIONAL", "LETTERING", "MINIMAL", "OTHER",
]);
export const TattooSizeSchema = z.enum(["SMALL", "MEDIUM", "LARGE", "OTHER"]);
export const ColorModeSchema = z.enum(["BLACK_AND_GREY", "COLOR"]);

export const Step1Schema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  style: TattooStyleSchema,
  styleOther: z.string().trim().min(2).max(50).optional(),
  bodyZone: z.string().trim().min(2).max(50),
  size: TattooSizeSchema,
  sizeNotes: z.string().trim().min(2).max(50).optional(),
  colorMode: ColorModeSchema,
  detailLevel: z.number().int().min(1).max(5),
}).superRefine((v, ctx) => {
  if (v.style === "OTHER" && !v.styleOther) {
    ctx.addIssue({ code: "custom", path: ["styleOther"], message: "Requerido si style=OTHER" });
  }
  if (v.size === "OTHER" && !v.sizeNotes) {
    ctx.addIssue({ code: "custom", path: ["sizeNotes"], message: "Requerido si size=OTHER" });
  }
});

export const Step2Schema = z.object({
  specialInstructions: z.string().trim().max(600).optional(),
});

export const masterSchema = z.object({
  ...Step1Schema.shape,
  ...Step2Schema.shape,
})

export const stepSchemas = [
  Step1Schema,
  Step2Schema,
] as const;


export type Step1Input = z.infer<typeof Step1Schema>;
export type Step2Input = z.infer<typeof Step2Schema>;

export type MasterSchemaType = z.infer<typeof masterSchema>;
