"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefineSchema, type RefineInput } from "@/modules/schemas/tattoo";
import { useTattooGeneration } from "../hooks/use-tattoo-generation";
import PreviewGallery from "./preview-gallery";
import QuoteForm from "./quote-form";
import ConfirmationScreen from "./confirmation-screen";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { AlertCircle, Loader2, RefreshCw, Send } from "lucide-react";

interface ResultsStepProps {
  requestId: string | null;
}

type SubStep = "preview" | "quote" | "confirmation";

function GeneratingPlaceholder() {
  return (
    <div className="flex h-72 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-grotesk text-sm text-muted-foreground">
          Generando tu diseño con IA…
        </p>
      </div>
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

export default function ResultsStep({ requestId }: ResultsStepProps) {
  const [subStep, setSubStep] = useState<SubStep>("preview");
  const [confirmation, setConfirmation] = useState<{
    requestCode: string;
    trackingToken: string;
  } | null>(null);

  const {
    previews,
    selectedPreview,
    selectedPreviewId,
    selectPreview,
    attempts,
    maxAttempts,
    canRegenerate,
    attemptLabel,
    isGenerating,
    error: genError,
    generatePreview,
  } = useTattooGeneration(requestId, true);

  const {
    register,
    getValues,
    formState: { errors: refineErrors },
  } = useForm<RefineInput>({
    resolver: zodResolver(RefineSchema),
    defaultValues: { refineText: "" },
  });

  const hasPreviews = previews.length > 0;
  const isBusy = isGenerating;

  const handleGenerate = async () => {
    const refineText = getValues("refineText")?.trim() || undefined;
    await generatePreview(refineText);
  };

  const handleSendToQuote = () => {
    if (!selectedPreview) return;
    setSubStep("quote");
  };

  const handleQuoteSuccess = (requestCode: string, trackingToken: string) => {
    setConfirmation({ requestCode, trackingToken });
    setSubStep("confirmation");
  };

  const handleBackToPreview = () => {
    setSubStep("preview");
  };

  if (subStep === "confirmation" && confirmation) {
    return (
      <ConfirmationScreen
        requestCode={confirmation.requestCode}
        trackingToken={confirmation.trackingToken}
      />
    );
  }

  if (subStep === "quote" && selectedPreview && requestId) {
    return (
      <QuoteForm
        requestId={requestId}
        selectedPreview={selectedPreview}
        onSuccess={handleQuoteSuccess}
        onBack={handleBackToPreview}
      />
    );
  }

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-3">
        {selectedPreview ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <img
              src={selectedPreview.dataUrl}
              alt="Vista previa del diseño de tatuaje generado con IA"
              className="h-auto w-full object-contain"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="font-grotesk text-sm text-muted-foreground">
                    Regenerando…
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <GeneratingPlaceholder />
        )}

        {attemptLabel && (
          <p className="font-grotesk text-xs text-muted-foreground">
            {attemptLabel}
            {attempts >= maxAttempts && (
              <span className="ml-1 font-medium text-destructive">
                — límite alcanzado
              </span>
            )}
          </p>
        )}
      </div>

      <PreviewGallery
        previews={previews}
        selectedId={selectedPreviewId}
        onSelect={selectPreview}
        canAdd={canRegenerate}
        onAdd={handleGenerate}
        disabled={isBusy}
      />
      {hasPreviews && (
        <Field>
          <FieldLabel>Ajustes al diseño (opcional)</FieldLabel>
          <Textarea
            {...register("refineText")}
            placeholder="Ej: más detalle en las sombras, eliminar el fondo, hacerlo más minimalista…"
            className="min-h-20"
            disabled={isBusy}
          />
          {refineErrors.refineText && (
            <FieldError errors={[refineErrors.refineText]} />
          )}
        </Field>
      )}

      {genError && <ErrorBanner message={genError} />}

      {hasPreviews && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Regenerate */}
          <Button
            type="button"
            variant="outline"
            className="flex-1 font-grotesk"
            onClick={handleGenerate}
            disabled={isBusy || !canRegenerate}
            title={
              !canRegenerate
                ? `Límite de ${maxAttempts} intentos alcanzado`
                : undefined
            }
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regenerar con cambios
          </Button>
          <Button
            type="button"
            className="flex-1 font-grotesk font-semibold"
            onClick={handleSendToQuote}
            disabled={isBusy || !selectedPreview}
          >
            <Send className="h-4 w-4" />
            Enviar a cotización
          </Button>
        </div>
      )}
    </FieldGroup>
  );
}
