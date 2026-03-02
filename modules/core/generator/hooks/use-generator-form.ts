import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  masterSchema,
  stepSchemas,
  TOTAL_STEPS,
  type MasterSchemaType,
  type ContactInput,
} from "@/modules/schemas/tattoo";
import { api } from "@/lib/api";

type CreateRequestResponse = {
  id: string;
  trackingToken: string;
  isExisting: boolean;
};

const stepApiHandlers: Record<
  number,
  (values: MasterSchemaType, requestId: string | null) => Promise<string | null>
> = {
  // Step 1 no llama a la API directamente — lo hace el modal de contacto
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

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

    // Step 1: mostrar modal de contacto en vez de llamar a la API
    if (step === 1) {
      setShowContactModal(true);
      return;
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

  const handleContactSubmit = async (contact: ContactInput) => {
    setIsContactSubmitting(true);
    setContactError(null);
    try {
      const values = form.getValues();
      const res = await api<CreateRequestResponse>("/api/request", {
        method: "POST",
        body: JSON.stringify({
          style: values.style,
          bodyZone: values.bodyZone,
          size: values.size,
          colorMode: values.colorMode,
          detailLevel: values.detailLevel,
          fullName: contact.fullName,
          whatsapp: contact.whatsapp,
        }),
      });
      setRequestId(res.id);
      setShowContactModal(false);
      setStep(2);
    } catch (err) {
      setContactError(
        err instanceof Error ? err.message : "Error al registrar. Intenta de nuevo.",
      );
    } finally {
      setIsContactSubmitting(false);
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
    showContactModal,
    contactError,
    isContactSubmitting,
    goNext,
    goPrev,
    handleContactSubmit,
  };
}
