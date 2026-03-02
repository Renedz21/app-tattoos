"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, type ContactInput } from "@/modules/schemas/tattoo";
import { Button } from "@/modules/core/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import { Input } from "@/modules/core/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (data: ContactInput) => Promise<void>;
}

export default function ContactModal({
  isOpen,
  isSubmitting,
  error,
  onSubmit,
}: ContactModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    mode: "onTouched",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        <div className="p-6">
          <h2 className="font-bebas text-2xl tracking-wide">
            Antes de generar tu diseño
          </h2>
          <p className="mt-1 font-grotesk text-sm text-muted-foreground">
            Necesitamos tus datos para asociar el diseño a tu solicitud.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-5"
          >
            <FieldGroup>
              <Field>
                <FieldLabel>
                  Nombre completo <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...register("fullName")}
                  placeholder="Ej: Valentina Torres"
                  autoComplete="name"
                  disabled={isSubmitting}
                />
                {errors.fullName && <FieldError errors={[errors.fullName]} />}
              </Field>

              <Field>
                <FieldLabel>
                  WhatsApp <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...register("whatsapp")}
                  type="tel"
                  placeholder="Ej: +51 987 654 321"
                  autoComplete="tel"
                  disabled={isSubmitting}
                />
                {errors.whatsapp && <FieldError errors={[errors.whatsapp]} />}
              </Field>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p className="font-grotesk text-sm text-destructive">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-grotesk font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Continuar y generar diseño
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
