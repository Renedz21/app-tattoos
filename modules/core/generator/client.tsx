"use client";

import { FormProvider } from "react-hook-form";
import { useGeneratorForm } from "./hooks/use-generator-form";
import BasicStep from "./steps/basic-step";
import ReferencesStep from "./steps/references-step";
import ResultsStep from "./steps/results-step";
import StepIndicator from "./steps/step-indicator";
import { Button } from "../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

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
    apiError,
  } = useGeneratorForm();

  {
    apiError && (
      <p className="text-sm text-destructive mb-2">{apiError}</p>
    )
  }

  return (
    <FormProvider {...form}>
      <StepIndicator currentStep={step} />
      <div className="min-h-70">
        {step === 1 && <BasicStep />}
        {step === 2 && <ReferencesStep />}
        {step === 3 && <ResultsStep requestId={requestId} />}
      </div>
      <div className="mt-10">
        {isFirst && (
          <Button
            type="button"
            onClick={goNext}
            disabled={isTransitioning}
            className="w-full font-grotesk font-semibold "
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
