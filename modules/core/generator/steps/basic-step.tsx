import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/modules/core/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { MasterSchemaType } from "@/modules/schemas/tattoo";
import {
  BODY_PARTS,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  STYLE_OPTIONS,
} from "@/constants/generator";
import { cn } from "@/lib/utils";
import { Slider } from "../../components/ui/slider";

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
                    option.value === field.value
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

      <Controller
        control={control}
        name="bodyZone"
        render={({ field, fieldState }) => (
          <Field orientation="vertical" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor="form-body-part">Parte del cuerpo</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id="form-body-part"
                aria-invalid={fieldState.invalid}
                className="w-full max-w-full"
              >
                <SelectValue
                  className="placeholder:font-grotesk"
                  placeholder="Selecciona la zona del cuerpo"
                />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {BODY_PARTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        name="size"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-product-name">Tamaño</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button" // importante para evitar submit accidental
                  onClick={() => field.onChange(option.value)}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left font-grotesk transition-all",
                    option.value === field.value // ← comparación directa, sin toLowerCase
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </Field>
        )}
      />

      <Controller
        name="colorMode"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-product-name">Color</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button" // importante para evitar submit accidental
                  onClick={() => field.onChange(option.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-3 text-sm font-grotesk transition-all",
                    option.value === field.value // ← comparación directa, sin toLowerCase
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </Field>
        )}
      />

      <Controller
        name="detailLevel"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-product-name" className="mb-3">
              Nivel de detalle: {field.value}
            </FieldLabel>
            <Slider
              value={[field.value]}
              onValueChange={([v]) => setValue("detailLevel", v)}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground font-grotesk">
              <span>Simple</span>
              <span>Complejo</span>
            </div>
          </Field>
        )}
      />
    </FieldGroup>
  );
}
