import { generateImage } from "ai";
import { google } from "@ai-sdk/google";

// Modelo Gemini 3 Pro Image (AI Studio / Gemini API)
const MODEL_ID = "gemini-3-pro-image-preview";

export async function generateImages(prompt: string, numberOfImages?: number) {
  // Gemini image models: usar aspectRatio, no size.
  const { image } = await generateImage({
    model: google.image(MODEL_ID),
    prompt,
    aspectRatio: "1:1",
    maxImagesPerCall: 2,
    n: numberOfImages ? numberOfImages : undefined
  });

  // image.uint8Array -> listo para subir a R2
  return image.uint8Array;
}

export async function generateVariants(params: {
  instruction: string;
  baseImage: Uint8Array;
  n: number;
}) {
  // Edición: prompt con images[]
  return Promise.all(
    Array.from({ length: params.n }, async () => {
      const { image } = await generateImage({
        model: google.image(MODEL_ID),
        prompt: { text: params.instruction, images: [params.baseImage] },
        aspectRatio: "1:1",
      });
      return image.uint8Array;
    })
  );
}
