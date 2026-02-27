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
import { cn } from "@/lib/utils";
import useDepositForm from "../hooks/use-deposit-form";
import { STATUS_OPTIONS } from "@/modules/schemas/admin-filters.schema";
import { Button } from "@/modules/core/components/ui/button";

type Props = {
  defaultValues: any;
};

export default function AdminEditForm({ defaultValues }: Props) {
  const { form, handleSubmit } = useDepositForm(defaultValues);

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup className="w-full grid grid-cols-1 lg:grid-cols-3">
        <Controller
          name="depositCents"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Adelanto</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ingresa el monto parcial"
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
              <FieldLabel htmlFor={field.name}>Precio Total</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ingresa el monto total"
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
                <FieldLabel htmlFor="form-rhf-select-language">
                  Estado
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="form-rhf-select-language"
                  aria-invalid={fieldState.invalid}
                  className="w-auto"
                >
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {STATUS_OPTIONS.map((s) => (
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

      <div className="flex justify-end">
        <Button type="submit" className="lg:w-auto w-full">
          Guardar
        </Button>
      </div>
    </form>
  );
}
