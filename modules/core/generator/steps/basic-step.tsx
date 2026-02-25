import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/modules/core/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/modules/core/components/ui/field";
import { MasterSchemaType } from "@/modules/schemas/tattoo";
import { STYLE_OPTIONS } from "@/constants/generator";
import { cn } from "@/lib/utils";

export default function BasicStep() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<MasterSchemaType>();
  return (
    <FieldGroup>
      <Controller
        control={control}
        name="style"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-product-name">
              Estilo de Tatuaje
            </FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button" // importante para evitar submit accidental
                  onClick={() => field.onChange(option.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-body text-sm transition-all",
                    option.value === field.value.toLowerCase()
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span className="text-lg">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </Field>
        )}
      />
    </FieldGroup>
  );
}
