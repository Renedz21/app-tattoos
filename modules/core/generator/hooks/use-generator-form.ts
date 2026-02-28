import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  masterSchema,
  type MasterSchemaType,
  stepSchemas,
} from "@/modules/schemas/tattoo";
import { api } from "@/lib/api";

type CreateRequestResponse = {
  id: string;
  trackingToken: string;
  status: string;
};

type UpdateStep2Response = {
  id: string;
  status: string;
};

const TOTAL_STEPS = stepSchemas.length + 1;

export function useGeneratorForm() {
  const [step, setStep] = useState(1);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const form = useForm<MasterSchemaType>({
    resolver: zodResolver(masterSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      bodyZone: "",
      colorMode: "BLACK_AND_GREY",
      detailLevel: 3,
      size: undefined,
      sizeNotes: "",
      specialInstructions: "",
      style: undefined,
    },
  });

  const goNext = async () => {
    const schema = stepSchemas[step];

    if (schema) {
      const fields = Object.keys(
        "shape" in schema ? schema.shape : {},
      ) as (keyof MasterSchemaType)[];

      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    setIsTransitioning(true);

    try {
      if (step === 1) {
        const v = form.getValues();
        const res = await api<CreateRequestResponse>("/api/request", {
          method: "POST",
          body: JSON.stringify({
            title: v.title?.trim() || undefined,
            style: v.style,
            bodyZone: v.bodyZone,
            size: v.size,
            sizeNotes: v.sizeNotes?.trim() || undefined,
            colorMode: v.colorMode,
            detailLevel: v.detailLevel,
          }),
        });
        setRequestId(res.id);
      }
      if (step === 2 && requestId) {
        const v = form.getValues();
        await api<UpdateStep2Response>(`/api/request/${requestId}/step-2`, {
          method: "PUT",
          body: JSON.stringify({
            specialInstructions: v.specialInstructions?.trim() || undefined,
          }),
        });
      }
    } catch (err) {
      console.error(`[useGeneratorForm] step ${step} API error:`, err);
    } finally {
      setIsTransitioning(false);
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
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
    goNext,
    goPrev,
  };
}
