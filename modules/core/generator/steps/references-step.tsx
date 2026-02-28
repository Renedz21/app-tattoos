
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import { Controller, useFormContext } from "react-hook-form";
import { MasterSchemaType } from "@/modules/schemas/tattoo";
import { Textarea } from "@/modules/core/components/ui/textarea";

export default function ReferencesStep() {
  const { control } = useFormContext<MasterSchemaType>();

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="specialInstructions"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="references-special-instructions">
              Instrucciones para el diseño
            </FieldLabel>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            <Textarea
              {...field}
              id="references-special-instructions"
              aria-invalid={fieldState.invalid}
              placeholder="Aquí puedes ser muy específico con lo que quieres. Ej: Solo líneas, sin sombras, estilo japonés, incluir fecha, etc. "
              className="min-h-30"
              required
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
