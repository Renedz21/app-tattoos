import { RequestStatus } from "@/lib/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/labels";
import { z } from "zod";

export const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as RequestStatus[]
).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

// Zod enum acepta los valores exactos de Prisma + "" para "sin filtro"
export const adminFiltersSchema = z.object({
  search: z.string(),
  status: z.enum(["", ...Object.values(RequestStatus)] as [
    string,
    ...string[],
  ]),
});

export type AdminFiltersValues = z.infer<typeof adminFiltersSchema>;
