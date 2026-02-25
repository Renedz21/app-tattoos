import { Step1Input, Step2Input } from "@/modules/schemas/tattoo";

export function buildTattooPrompt(step1: Step1Input, step2?: Step2Input) {
  const style = step1.style === "OTHER" ? step1.styleOther : step1.style;
  const size = step1.size === "OTHER" ? step1.sizeNotes : step1.size;

  return [
    "Generate a tattoo design image.",
    `Style: ${style}.`,
    `Body placement: ${step1.bodyZone}.`,
    `Size: ${size}.`,
    `Color: ${step1.colorMode === "COLOR" ? "color" : "black and grey"}.`,
    `Detail level (1-5): ${step1.detailLevel}.`,
    step2?.specialInstructions ? `Extra instructions: ${step2.specialInstructions}.` : null,
    "No text. No watermark text. One image.",
  ].filter(Boolean).join("\n");
}
