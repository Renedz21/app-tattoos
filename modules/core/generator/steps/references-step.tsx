import { useFileUpload } from "@/modules/hooks/use-file-upload";
import { AlertCircleIcon, Upload, XIcon } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { Controller, useFormContext } from "react-hook-form";
import { MasterSchemaType } from "@/modules/schemas/tattoo";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

export default function ReferencesStep() {
  const { control } = useFormContext<MasterSchemaType>();

  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 6;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    maxFiles,
    maxSize,
    multiple: true,
  });

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Imágenes de referencia (opcional)</FieldLabel>
        <div className="space-y-2">
          <div
            data-dragging={isDragging || undefined}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          >
            <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="font-body text-sm text-muted-foreground">
              Arrastra imágenes aquí o{" "}
              <label className="text-primary cursor-pointer hover:underline">
                selecciona archivos
                <input
                  {...getInputProps()}
                  aria-label="Upload image file"
                  className="sr-only"
                />
              </label>
            </p>
            <p className="mt-1 font-body text-xs text-muted-foreground/60">
              PNG, JPG, WEBP · máx. {maxSizeMB} MB por archivo · hasta{" "}
              {maxFiles} imágenes
            </p>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-4 md:grid-cols-4 mt-4">
              {files.map((file) => (
                <div
                  className="relative aspect-square rounded-md bg-accent"
                  key={file.id}
                >
                  <img
                    alt={file.file.name}
                    className="size-full rounded-[inherit] object-cover"
                    src={file.preview}
                  />
                  <Button
                    aria-label="Remove image"
                    className="-top-2 -right-2 absolute size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
                    onClick={() => removeFile(file.id)}
                    size="icon"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {errors.length > 0 && (
            <div
              className="flex items-center gap-1 text-destructive text-xs"
              role="alert"
            >
              <AlertCircleIcon className="size-3 shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>
      </Field>
      <Controller
        control={control}
        name="specialInstructions"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="references-special-instructions">
              Instrucciones especiales (opcional)
            </FieldLabel>
            <Textarea
              {...field}
              id="references-special-instructions"
              aria-invalid={fieldState.invalid}
              placeholder="Ej: Solo líneas, sin sombras, estilo japonés, incluir fecha..."
              className="min-h-30"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
