"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { RequestStatus } from "@/lib/generated/prisma/enums";

export const adminLeadFormSchema = z.object({
  priceCents: z
    .number({ error: "Ingresa un monto válido" })
    .int("Debe ser un número entero")
    .positive("El precio debe ser mayor a 0")
    .optional(),
  depositCents: z
    .number({ error: "Ingresa un monto válido" })
    .int("Debe ser un número entero")
    .positive("El adelanto debe ser mayor a 0")
    .optional(),
  status: z.enum(RequestStatus).optional(),
  appointmentAt: z.date().optional(),
});

export type AdminLeadFormValues = z.infer<typeof adminLeadFormSchema>;

export type AdminLeadFormDefaults = {
  id: string;
  priceCents?: number | null;
  depositCents?: number | null;
  status?: RequestStatus | null;
};

type SubmitResult = { ok: true } | { ok: false; message: string };

export function useAdminLeadForm(defaults: AdminLeadFormDefaults) {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminLeadFormValues>({
    resolver: zodResolver(adminLeadFormSchema),
    defaultValues: {
      priceCents: defaults.priceCents ?? undefined,
      depositCents: defaults.depositCents ?? undefined,
      status: defaults.status ?? undefined,
    },
  });

  const handleSubmit = async (data: AdminLeadFormValues) => {
    setIsSubmitting(true);
    setResult(null);

    const { id } = defaults;
    const errors: string[] = [];

    try {
      const hasQuoteData =
        data.priceCents !== undefined || data.depositCents !== undefined;
      const quoteChanged =
        data.priceCents !== (defaults.priceCents ?? undefined) ||
        data.depositCents !== (defaults.depositCents ?? undefined);

      if (hasQuoteData && quoteChanged) {
        if (!data.priceCents || !data.depositCents) {
          errors.push("Debes ingresar tanto el precio total como el adelanto.");
        } else {
          try {
            await api(`/api/admin/requests/${id}/quote`, {
              method: "POST",
              body: JSON.stringify({
                priceCents: data.priceCents,
                depositCents: data.depositCents,
                currency: "PEN",
              }),
            });
          } catch (err) {
            const msg =
              err instanceof ApiError
                ? `Error al guardar cotización (${err.status})`
                : "Error inesperado al guardar la cotización.";
            errors.push(msg);
          }
        }
      }

      const statusChanged = data.status && data.status !== defaults.status;

      if (statusChanged && data.status) {
        try {
          await api(`/api/admin/requests/${id}/status`, {
            method: "POST",
            body: JSON.stringify({
              status: data.status,
              ...(data.appointmentAt
                ? { appointmentAt: data.appointmentAt }
                : {}),
            }),
          });
        } catch (err) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown> | null;
            if (body?.error === "invalid_transition") {
              errors.push(
                `Transición de estado inválida: "${body.current}" → "${body.target}".`,
              );
            } else {
              errors.push(`Error al cambiar estado (${err.status}).`);
            }
          } else {
            errors.push("Error inesperado al cambiar el estado.");
          }
        }
      }

      if (errors.length > 0) {
        setResult({ ok: false, message: errors.join(" ") });
      } else {
        setResult({ ok: true });
        form.reset(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    handleSubmit,
    isSubmitting,
    result,
    clearResult: () => setResult(null),
  };
}
