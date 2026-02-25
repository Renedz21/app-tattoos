"use client";

import { FormProvider } from "react-hook-form";
import { useGeneratorForm } from "./hooks/use-generator-form";
import BasicStep from "./steps/basic-step";
import StepIndicator from "./steps/step-indicator";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

const STEP_COMPONENTS: Record<number, React.ReactNode> = {
  1: <BasicStep />,
  2: <>2</>,
  3: <>3</>,
};

export default function GeneratorClient() {
  const { form, step, goNext, goPrev, isFirst, isLast, totalSteps } =
    useGeneratorForm();

  return (
    <FormProvider {...form}>
      <StepIndicator currentStep={step} />

      <div className="min-h-[280px]">{STEP_COMPONENTS[step]}</div>

      <div className="flex justify-between gap-3">
        {!isFirst && step < totalSteps && (
          <Button type="button" variant="ghost" onClick={goPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        )}
        <Button type="button" variant="default" onClick={goNext}>
          Siguiente
        </Button>
      </div>
    </FormProvider>
  );
}
