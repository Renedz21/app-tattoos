"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/modules/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import { Button } from "@/modules/core/components/ui/button";
import {
  useAdminLeadForm,
  type AdminLeadFormDefaults,
} from "../hooks/use-deposit-form";
import { STATUS_OPTIONS } from "@/modules/schemas/admin-filters.schema";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { RequestStatus } from "@/lib/generated/prisma/enums";

type Props = {
  defaults: AdminLeadFormDefaults;
};

function SuccessBanner() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      <p className="font-grotesk text-sm text-emerald-500">
        Cambios guardados correctamente.
      </p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <p className="font-grotesk text-sm text-destructive">{message}</p>
    </div>
  );
}

export default function AdminEditForm({ defaults }: Props) {
  const { form, handleSubmit, isSubmitting, result, clearResult } =
    useAdminLeadForm(defaults);
  const selectableStatuses = STATUS_OPTIONS.filter(
    (s) =>
      s.value !== RequestStatus.FINISHED && s.value !== RequestStatus.EXPIRED,
  );
  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(handleSubmit)}
      onChange={result ? clearResult : undefined}
    >
      <FieldGroup className="w-full grid grid-cols-1 lg:grid-cols-3">
        <Controller
          name="depositCents"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="admin-deposit-cents">
                Adelanto (S/)
              </FieldLabel>
              <Input
                id="admin-deposit-cents"
                type="number"
                min={1}
                step={1}
                placeholder="Ej: 5000"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                value={field.value ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === "" ? undefined : Number(raw));
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="priceCents"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="admin-price-cents">
                Precio total (S/)
              </FieldLabel>
              <Input
                id="admin-price-cents"
                type="number"
                min={1}
                step={1}
                placeholder="Ej: 20000"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                value={field.value ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === "" ? undefined : Number(raw));
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="admin-status-select">Estado</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="admin-status-select"
                  aria-invalid={fieldState.invalid}
                  className="w-auto"
                >
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {selectableStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </FieldGroup>
      {result?.ok === true && <SuccessBanner />}
      {result?.ok === false && <ErrorBanner message={result.message} />}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="lg:w-auto w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}
