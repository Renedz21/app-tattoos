import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single AI-generated preview kept in client memory (never persisted). */
export type PreviewItem = {
  id: string;
  createdAt: number;
  dataUrl: string;
  mimeType: string;
  /** The refine text that was used to generate this preview (if any). */
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useTattooGeneration
 *
 * Manages the AI preview generation lifecycle for Step 3.
 *
 * Changes from v1:
 *  - Stores an array of PreviewItem (up to MAX_ATTEMPTS) instead of a single
 *    dataUrl. All previews live in React state only — nothing is sent to
 *    DB / R2 until the user explicitly submits.
 *  - Exposes `selectedPreviewId` + `selectPreview(id)` so the user can pick
 *    any previously generated preview as "the chosen one".
 *  - The newest generation is auto-selected on creation.
 *  - `selectedPreview` is a derived getter for convenience (avoids repeated
 *    `.find()` in consumer components).
 *  - `attemptLabel` returns a ready-to-render string like "Intento 2 de 3".
 */
export function useTattooGeneration(
  requestId: string | null,
  /** When true, fires generatePreview() automatically on mount. Default: false. */
  autoGenerate = false,
) {
  const [state, setState] = useState<GenerationState>({
    previews: [],
    selectedPreviewId: null,
    isGenerating: false,
    error: null,
  });

  // Ref-based lock prevents concurrent calls (double-click, etc.)
  const lockRef = useRef(false);

  // ── Auto-generate on mount ──────────────────────────────────────────────
  // Fires once when the component mounts with autoGenerate=true AND a valid
  // requestId AND no previews have been generated yet.
  // The empty-array dep list is intentional: we only want this to run once
  // per mount. `generatePreview` is stable (useCallback with no deps that
  // change on mount), so capturing it via the ref below avoids the stale-
  // closure problem without adding it to the effect deps.
  const generatePreviewRef = useRef<(refineText?: string) => Promise<void>>(
    async () => {},
  );

  // ── Derived values ──────────────────────────────────────────────────────

  const attempts = state.previews.length;
  const canRegenerate = attempts < MAX_ATTEMPTS && !state.isGenerating;

  const selectedPreview =
    state.previews.find((p) => p.id === state.selectedPreviewId) ?? null;

  const attemptLabel =
    attempts > 0 ? `Intento ${attempts} de ${MAX_ATTEMPTS}` : "";

  // ── Actions ─────────────────────────────────────────────────────────────

  /** Select a previously generated preview by its id. */
  const selectPreview = useCallback((id: string) => {
    setState((s) => {
      // Only update if the id actually exists in the list
      const exists = s.previews.some((p) => p.id === id);
      if (!exists) return s;
      return { ...s, selectedPreviewId: id };
    });
  }, []);

  /**
   * Generate a new preview via the AI endpoint.
   * Appends the result to the previews array (capped at MAX_ATTEMPTS)
   * and auto-selects it.
   */
  const generatePreview = useCallback(
    async (refineText?: string) => {
      if (!requestId) {
        setState((s) => ({ ...s, error: "No hay solicitud activa." }));
        return;
      }

      if (lockRef.current) return;

      // Check limit against current state via the updater to avoid stale reads
      // We do a quick optimistic check here, the real guard is inside setState
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
          // Double-check inside updater (Strict Mode safety)
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

  // Keep the ref in sync so the auto-generate effect always calls the latest
  // version without needing it in the effect dependency array.
  generatePreviewRef.current = generatePreview;

  useEffect(() => {
    if (!autoGenerate) return;
    if (!requestId) return;
    // Only fire when there are no previews yet (idempotent on re-renders)
    if (state.previews.length > 0) return;

    generatePreviewRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, requestId]);

  // ── Public API ──────────────────────────────────────────────────────────

  return {
    /** All generated previews (in creation order, max MAX_ATTEMPTS). */
    previews: state.previews,
    /** The currently highlighted preview (derived from selectedPreviewId). */
    selectedPreview,
    /** Id of the currently selected preview. */
    selectedPreviewId: state.selectedPreviewId,
    /** Set a different preview as the active selection. */
    selectPreview,
    /** Number of previews generated so far. */
    attempts,
    /** Hard cap. */
    maxAttempts: MAX_ATTEMPTS,
    /** True when the user can still generate another preview. */
    canRegenerate,
    /** Ready-to-render label, e.g. "Intento 2 de 3" or "" if none yet. */
    attemptLabel,
    /** True while an AI call is in flight. */
    isGenerating: state.isGenerating,
    /** Last error message (cleared on next generation attempt). */
    error: state.error,
    /** Trigger a new AI generation (appends to history, auto-selects). */
    generatePreview,
  };
}
