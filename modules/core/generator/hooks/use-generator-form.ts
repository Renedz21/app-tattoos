import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  masterSchema,
  type MasterSchemaType,
  stepSchemas,
} from "@/modules/schemas/tattoo";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateRequestResponse = {
  id: string;
  trackingToken: string;
  status: string;
};

type UpdateStep2Response = {
  id: string;
  status: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

// stepSchemas has [Step1Schema, Step2Schema] — Step 3 has no master-form fields
const TOTAL_STEPS = stepSchemas.length + 1; // 3

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useGeneratorForm
 *
 * Drives the 3-step wizard:
 *  - Holds the single RHF form instance shared across Step 1 and Step 2
 *    via <FormProvider>.
 *  - Step 3 (ResultsStep) manages its own isolated refine form internally.
 *  - On Step 1 → 2: validates Step1 fields, then POST /api/request to
 *    create the TattooRequest and store the returned id as requestId.
 *  - On Step 2 → 3: validates Step2 fields, then PUT /api/request/:id/step-2
 *    to persist specialInstructions.
 *  - isTransitioning gates the navigation buttons while the API call is in
 *    flight so the user cannot double-submit.
 *
 * Assumption: errors during API calls are logged to the console but do NOT
 * block navigation — the wizard advances optimistically so a temporary
 * network hiccup doesn't trap the user. This can be tightened later.
 */
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

  // ── Navigation ──────────────────────────────────────────────────────────

  const goNext = async () => {
    // stepSchemas is 0-indexed; step is 1-indexed
    // stepSchemas[0] = Step1Schema, stepSchemas[1] = Step2Schema
    // Step 3 has no schema entry — skip validation
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
      // ── Step 1 → 2: create TattooRequest ────────────────────────────
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

      // ── Step 2 → 3: persist specialInstructions ──────────────────────
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
      // Log but don't block — see assumption note in JSDoc above
      console.error(`[useGeneratorForm] step ${step} API error:`, err);
    } finally {
      setIsTransitioning(false);
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  // ── Return ──────────────────────────────────────────────────────────────

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
