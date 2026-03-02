"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuoteFormSchema, type QuoteFormInput } from "@/modules/schemas/tattoo";
import { useR2PresignedUpload } from "../hooks/use-r2-presigned-upload";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/modules/core/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import { Input } from "@/modules/core/components/ui/input";
import { Textarea } from "@/modules/core/components/ui/textarea";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import type { PreviewItem } from "../hooks/use-tattoo-generation";

interface QuoteFormProps {
  requestId: string;
  selectedPreview: PreviewItem;
  onSuccess: (requestCode: string, trackingToken: string) => void;
  onBack: () => void;
}

type SubmitQuoteResponse = {
  requestCode: string;
  trackingToken: string;
};

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

export default function QuoteForm({
  requestId,
  selectedPreview,
  onSuccess,
  onBack,
}: QuoteFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { presignAndUpload, isUploading } = useR2PresignedUpload();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormInput>({
    resolver: zodResolver(QuoteFormSchema),
    mode: "onTouched",
  });

  const isBusy = isSubmitting || isUploading;

  const onSubmit = async (values: QuoteFormInput) => {
    setSubmitError(null);

    try {
      const { r2Key, mimeType, sizeBytes } = await presignAndUpload(
        requestId,
        selectedPreview.dataUrl,
        selectedPreview.mimeType,
      );

      const result = await api<SubmitQuoteResponse>(
        `/api/request/${requestId}/submit-quote`,
        {
          method: "POST",
          body: JSON.stringify({
            ...values,
            r2Key,
            mimeType,
            sizeBytes,
          }),
        },
      );

      onSuccess(result.requestCode, result.trackingToken);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown> | null;
        if (body?.error === "already_submitted") {
          setSubmitError(
            "Esta solicitud ya fue enviada anteriormente. Recarga la página para comenzar de nuevo.",
          );
          return;
        }
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al enviar. Por favor, intenta de nuevo.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-3">
          <img
            src={selectedPreview.dataUrl}
            alt="Diseño seleccionado"
            className="h-20 w-20 shrink-0 rounded-lg object-cover shadow-sm"
          />
          <div className="min-w-0">
            <p className="font-bebas text-lg tracking-wide leading-tight">
              Tu diseño seleccionado
            </p>
            <p className="font-grotesk text-sm text-muted-foreground">
              Completa tus datos para enviar la solicitud de cotización.
            </p>
          </div>
        </div>
        <Field>
          <FieldLabel>
            Distrito <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("district")}
            placeholder="Ej: Miraflores"
            autoComplete="address-level2"
            disabled={isBusy}
          />
          {errors.district && <FieldError errors={[errors.district]} />}
        </Field>
        <Field>
          <FieldLabel>
            Disponibilidad <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("availability")}
            placeholder="Ej: Fines de semana por la tarde"
            disabled={isBusy}
          />
          {errors.availability && <FieldError errors={[errors.availability]} />}
        </Field>
        <Field>
          <FieldLabel>Comentarios adicionales (opcional)</FieldLabel>
          <Textarea
            {...register("extraComments")}
            placeholder="Ej: Tengo sensibilidad en esa zona, prefiero sesiones cortas…"
            className="min-h-20"
            disabled={isBusy}
          />
          {errors.extraComments && (
            <FieldError errors={[errors.extraComments]} />
          )}
        </Field>
        {submitError && <ErrorBanner message={submitError} />}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isBusy}
            className="font-grotesk sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al diseño
          </Button>

          <Button
            type="submit"
            disabled={isBusy}
            className="flex-1 font-grotesk font-semibold"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isUploading ? "Subiendo imagen…" : "Enviando solicitud…"}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar solicitud de cotización
              </>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
