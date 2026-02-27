import { RequestStatus } from "@/lib/generated/prisma/enums";
import { z } from "zod";

export const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "SENT", label: "Enviado" },
  { value: "QUOTED", label: "Cotizado" },
  { value: "DEPOSIT_PENDING", label: "Seña pendiente" },
  { value: "APPOINTMENT_CONFIRMED", label: "Turno confirmado" },
  { value: "FINISHED", label: "Finalizado" },
  { value: "EXPIRED", label: "Expirado" },
];

// Zod enum acepta los valores exactos de Prisma + "" para "sin filtro"
export const adminFiltersSchema = z.object({
  search: z.string(),
  status: z.enum(["", ...Object.values(RequestStatus)] as [string, ...string[]])
});

export type AdminFiltersValues = z.infer<typeof adminFiltersSchema>;
