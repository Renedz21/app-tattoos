"use client";

import { FormProvider } from "react-hook-form";
import { useGeneratorForm } from "./hooks/use-generator-form";
import BasicStep from "./steps/basic-step";
import ReferencesStep from "./steps/references-step";
import ResultsStep from "./steps/results-step";
import StepIndicator from "./steps/step-indicator";
import { Button } from "../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

/**
 * GeneratorClient
 *
 * RSC-compatible client shell for the 3-step tattoo wizard.
 * Owns the shared RHF <FormProvider> (Step 1 + 2 fields).
 * Step 3 (ResultsStep) manages its own isolated refine form internally.
 *
 * Navigation buttons live here so they stay consistent across steps.
 * ResultsStep owns its own "Enviar a cotización" button because that
 * action belongs to Step 3's domain (presign → upload → complete).
 */
export default function GeneratorClient() {
  const {
    form,
    step,
    requestId,
    goNext,
    goPrev,
    isFirst,
    isLast,
    isTransitioning,
  } = useGeneratorForm();

  return (
    <FormProvider {...form}>
      <StepIndicator currentStep={step} />

      {/* Step content — min-height keeps the layout stable during transitions */}
      <div className="min-h-70">
        {step === 1 && <BasicStep />}
        {step === 2 && <ReferencesStep />}
        {step === 3 && <ResultsStep requestId={requestId} />}
      </div>

      {/* Navigation — hidden on Step 3 (ResultsStep owns its own actions) */}
      <div className="mt-10">
        {isFirst && (
          <Button
            type="button"
            onClick={goNext}
            disabled={isTransitioning}
            className="w-full font-grotesk font-semibold"
            size="lg"
          >
            {isTransitioning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Siguiente: Referencias
          </Button>
        )}

        {step === 2 && (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={isTransitioning}
              className="font-body"
            >
              <ArrowLeft size={16} />
              Atrás
            </Button>

            <Button
              type="button"
              onClick={goNext}
              disabled={isTransitioning}
              className="flex-1 font-body font-semibold"
              size="lg"
            >
              {isTransitioning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Generar diseños con IA
            </Button>
          </div>
        )}

        {/* Step 3: only a "back" escape hatch — primary actions are inside ResultsStep */}
        {isLast && (
          <Button
            type="button"
            variant="ghost"
            onClick={goPrev}
            disabled={isTransitioning}
            className="font-body text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Volver a referencias
          </Button>
        )}
      </div>
    </FormProvider>
  );
}
