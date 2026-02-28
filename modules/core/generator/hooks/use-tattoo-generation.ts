import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const MAX_ATTEMPTS = 3;

export type PreviewItem = {
  id: string;
  createdAt: number;
  dataUrl: string;
  mimeType: string;
  refineText?: string;
};

type PreviewResponse = {
  dataUrl: string;
  mimeType: string;
};

type GenerationState = {
  previews: PreviewItem[];
  selectedPreviewId: string | null;
  isGenerating: boolean;
  error: string | null;
};

export function useTattooGeneration(
  requestId: string | null,
  autoGenerate = false,
) {
  const [state, setState] = useState<GenerationState>({
    previews: [],
    selectedPreviewId: null,
    isGenerating: false,
    error: null,
  });
  const lockRef = useRef(false);
  const generatePreviewRef = useRef<(refineText?: string) => Promise<void>>(
    async () => {},
  );
  const attempts = state.previews.length;
  const canRegenerate = attempts < MAX_ATTEMPTS && !state.isGenerating;

  const selectedPreview =
    state.previews.find((p) => p.id === state.selectedPreviewId) ?? null;

  const attemptLabel =
    attempts > 0 ? `Intento ${attempts} de ${MAX_ATTEMPTS}` : "";

  const selectPreview = useCallback((id: string) => {
    setState((s) => {
      const exists = s.previews.some((p) => p.id === id);
      if (!exists) return s;
      return { ...s, selectedPreviewId: id };
    });
  }, []);

  const generatePreview = useCallback(
    async (refineText?: string) => {
      if (!requestId) {
        setState((s) => ({ ...s, error: "No hay solicitud activa." }));
        return;
      }

      if (lockRef.current) return;
      if (state.previews.length >= MAX_ATTEMPTS) {
        setState((s) => ({
          ...s,
          error: `Alcanzaste el máximo de ${MAX_ATTEMPTS} intentos.`,
        }));
        return;
      }

      lockRef.current = true;
      setState((s) => ({ ...s, isGenerating: true, error: null }));

      try {
        const trimmed = refineText?.trim() || undefined;

        const data = await api<PreviewResponse>(
          `/api/request/${requestId}/generate-preview`,
          {
            method: "POST",
            body: JSON.stringify({ refineText: trimmed }),
          },
        );

        const newPreview: PreviewItem = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          dataUrl: data.dataUrl,
          mimeType: data.mimeType,
          refineText: trimmed,
        };

        setState((s) => {
          if (s.previews.length >= MAX_ATTEMPTS) {
            return { ...s, isGenerating: false };
          }

          const nextPreviews = [...s.previews, newPreview];

          return {
            ...s,
            previews: nextPreviews,
            selectedPreviewId: newPreview.id,
            isGenerating: false,
          };
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al generar el diseño. Intenta de nuevo.";

        setState((s) => ({
          ...s,
          isGenerating: false,
          error: message,
        }));
      } finally {
        lockRef.current = false;
      }
    },
    [requestId, state.previews.length],
  );
  generatePreviewRef.current = generatePreview;

  useEffect(() => {
    if (!autoGenerate) return;
    if (!requestId) return;
    if (state.previews.length > 0) return;

    generatePreviewRef.current();
  }, [autoGenerate, requestId]);

  return {
    previews: state.previews,
    selectedPreview,
    selectedPreviewId: state.selectedPreviewId,
    selectPreview,
    attempts,
    maxAttempts: MAX_ATTEMPTS,
    canRegenerate,
    attemptLabel,
    isGenerating: state.isGenerating,
    error: state.error,
    generatePreview,
  };
}
