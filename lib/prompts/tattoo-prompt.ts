import { Step1Input, Step2Input } from "@/modules/schemas/tattoo";

export function buildTattooPrompt(step1: Step1Input, step2?: Step2Input) {
  const style = step1.style;
  const color = step1.colorMode === "COLOR" ? "a color" : "en blanco y negro";
  const detail =
    step1.detailLevel <= 2
      ? "nivel de detalle bajo"
      : step1.detailLevel === 3
        ? "nivel de detalle medio"
        : "nivel de detalle alto";

  const coreIdea = step2?.specialInstructions
    ? step2.specialInstructions
    : "Crea un concepto de tatuaje visualmente impactante.";

  return `
${coreIdea}
Transforma esta idea en un diseño de tatuaje profesional estilo ${style.toLowerCase()}, pensado para ${step1.bodyZone.toLowerCase()}, tamaño ${step1.size.toLowerCase()}, ${color}, con ${detail}. La imagen debe ser una única composición cohesiva en un solo lienzo.
Debe estar diseñada específicamente como un tatuaje real. La imagen final debe contener únicamente el arte del tatuaje. No incluir texto, letras, tipografía, frases, descripciones, etiquetas, elementos de interfaz, mockups, bordes ni marcas de agua. Genera exactamente una sola imagen.
`.trim();
}
