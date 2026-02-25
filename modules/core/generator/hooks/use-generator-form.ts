import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masterSchema, MasterSchemaType, stepSchemas } from "@/modules/schemas/tattoo";

const TOTAL_STEPS = stepSchemas.length + 1;

export function useGeneratorForm() {

  const [step, setStep] = useState(1);

  const form = useForm<MasterSchemaType>({
    resolver: zodResolver(masterSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      bodyZone: "",
      colorMode: "BLACK_AND_GREY",
      detailLevel: 3,
      size: "MEDIUM",
      sizeNotes: "",
      specialInstructions: "",
      style: "BLACKWORK",
      styleOther: ""
    },
  });

  const goNext = async () => {
    // Paso 6 = Finalizar, solo navega al dashboard
    if (step === TOTAL_STEPS) {
      form.handleSubmit(async (data: MasterSchemaType) => {
        console.log(data)
      });
    }

    // Ultimo paso
    const schema = stepSchemas[step - 1];
    if (schema) {
      const fields = Object.keys("shape" in schema ? schema.shape : {}) as (keyof MasterSchemaType)[];
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    //setLoading(true);
    //await new Promise((r) => setTimeout(r, 500));
    //setLoading(false);
    setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  return {
    form, step,
    isFirst: step === 1,
    isLast: step === TOTAL_STEPS,
    totalSteps: TOTAL_STEPS,
    goNext, goPrev,
  };
}
