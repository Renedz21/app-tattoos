"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuoteFormSchema, type QuoteFormInput } from "@/modules/schemas/tattoo";
import { useR2PresignedUpload } from "../hooks/use-r2-presigned-upload";
import { api, ApiError } from "@/lib/api";
import { Button } from "../../components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import type { PreviewItem } from "../hooks/use-tattoo-generation";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Subcomponents ────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * QuoteForm
 *
 * Second sub-step of Step 3. Shown after the user clicks "Enviar a cotización"
 * on the ResultsStep. It:
 *
 *  1. Displays the selected preview as a reference thumbnail.
 *  2. Collects contact + availability data via RHF + zod.
 *  3. On submit:
 *       a. Uploads the selected preview blob directly to R2 (presign + PUT).
 *       b. Calls POST /api/request/:id/submit-quote with contact data + R2 metadata.
 *       c. On success, calls onSuccess(requestCode, trackingToken).
 *
 * The binary NEVER passes through Vercel — only the R2 key and metadata
 * are sent to the API route.
 */
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
      // Step 1 + 2: upload selected preview blob directly to R2
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
        {/* ── Preview thumbnail ──────────────────────────────────────────── */}
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

        {/* ── Nombre completo ────────────────────────────────────────────── */}
        <Field>
          <FieldLabel>
            Nombre completo <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("fullName")}
            placeholder="Ej: Valentina Torres"
            autoComplete="name"
            disabled={isBusy}
          />
          {errors.fullName && <FieldError errors={[errors.fullName]} />}
        </Field>

        {/* ── WhatsApp ───────────────────────────────────────────────────── */}
        <Field>
          <FieldLabel>
            WhatsApp <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("whatsapp")}
            type="tel"
            placeholder="Ej: +51 987 654 321"
            autoComplete="tel"
            disabled={isBusy}
          />
          {errors.whatsapp && <FieldError errors={[errors.whatsapp]} />}
        </Field>

        {/* ── Distrito ──────────────────────────────────────────────────── */}
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

        {/* ── Disponibilidad ────────────────────────────────────────────── */}
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

        {/* ── Comentarios extra ─────────────────────────────────────────── */}
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

        {/* ── Error global ──────────────────────────────────────────────── */}
        {submitError && <ErrorBanner message={submitError} />}

        {/* ── Actions ───────────────────────────────────────────────────── */}
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
