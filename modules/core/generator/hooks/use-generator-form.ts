import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  masterSchema,
  stepSchemas,
  TOTAL_STEPS,
  type MasterSchemaType,
} from "@/modules/schemas/tattoo";
import { api } from "@/lib/api";

const stepApiHandlers: Record<number,
  (values: MasterSchemaType, requestId: string | null) => Promise<string | null>
> = {
  1: async (v) => {
    const res = await api<{ id: string }>("/api/request", {
      method: "POST",
      body: JSON.stringify({
        style: v.style,
        bodyZone: v.bodyZone,
        size: v.size,
        colorMode: v.colorMode,
        detailLevel: v.detailLevel,
      }),
    });
    return res.id;
  },
  2: async (v, requestId) => {
    await api(`/api/request/${requestId}/step-2`, {
      method: "PUT",
      body: JSON.stringify({
        specialInstructions: v.specialInstructions?.trim() || undefined,
      }),
    });
    return requestId;
  },
};

export function useGeneratorForm() {
  const [step, setStep] = useState(1);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<MasterSchemaType>({
    resolver: zodResolver(masterSchema),
    mode: "onTouched",
    defaultValues: {
      bodyZone: "",
      colorMode: "BLACK_AND_GREY",
      detailLevel: 3,
      size: undefined,
      specialInstructions: "",
      style: undefined,
    },
  });

  const goNext = async () => {
    const schema = stepSchemas[step - 1];

    if (schema) {
      const fields = Object.keys(schema.shape) as (keyof MasterSchemaType)[];
      const isValid = await form.trigger(fields);
      if (!isValid) return;
    }
    const handler = stepApiHandlers[step];

    if (!handler) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      return;
    }

    setIsTransitioning(true);
    setApiError(null);
    try {
      const nextRequestId = await handler(form.getValues(), requestId);
      if (nextRequestId) setRequestId(nextRequestId);
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setApiError(message);
    } finally {
      setIsTransitioning(false);
    }
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  return {
    form,
    step,
    requestId,
    isFirst: step === 1,
    isLast: step === TOTAL_STEPS,
    totalSteps: TOTAL_STEPS,
    isTransitioning,
    apiError,
    goNext,
    goPrev,
  };
}