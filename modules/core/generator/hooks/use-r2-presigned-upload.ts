import { useCallback, useState } from "react";
import { api } from "@/lib/api";

// ─── Public types ─────────────────────────────────────────────────────────────

/** Result returned by presignAndUpload — enough info to call submit-quote. */
export type PresignAndUploadResult = {
  r2Key: string;
  mimeType: string;
  sizeBytes: number;
};

// ─── Types ────────────────────────────────────────────────────────────────────

type PresignResponse = {
  uploadUrl: string;
  r2Key: string;
};

type CompleteResponse = {
  selectedImageId: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a base64 dataUrl to a Blob for direct PUT upload to R2.
 * Extracted as a pure function so it's easy to unit-test independently.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useR2PresignedUpload
 *
 * Orchestrates the three-step flow for persisting the user's selected image:
 *
 *   1. presignSelected  → POST /api/uploads/presign-selected
 *                         Server returns { uploadUrl, r2Key }
 *
 *   2. uploadToR2       → PUT uploadUrl (direct client → R2, binary NEVER
 *                         passes through Vercel — critical for size limits)
 *
 *   3. completeSelected → POST /api/request/:id/selected-image
 *                         Server creates GeneratedImage + sets selectedImageId
 *
 * The three steps are also exported individually so callers can compose them
 * if needed (e.g. progress tracking in a future iteration).
 */
export function useR2PresignedUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1 ────────────────────────────────────────────────────────────────

  const presignSelected = useCallback(
    (params: { requestId: string; mimeType: string; ext: string }) =>
      api<PresignResponse>("/api/uploads/presign-selected", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    [],
  );

  // ── Step 2 ────────────────────────────────────────────────────────────────

  const uploadToR2 = useCallback(
    async (uploadUrl: string, blob: Blob, mimeType: string): Promise<void> => {
      // Use plain fetch — no JSON wrapper, Content-Type must match presign
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      });

      if (!res.ok) {
        throw new Error(`R2 upload failed with status ${res.status}`);
      }
    },
    [],
  );

  // ── Step 3 ────────────────────────────────────────────────────────────────

  const completeSelected = useCallback(
    (params: {
      requestId: string;
      r2Key: string;
      mimeType: string;
      sizeBytes: number;
    }) =>
      api<CompleteResponse>(`/api/request/${params.requestId}/selected-image`, {
        method: "POST",
        body: JSON.stringify({
          r2Key: params.r2Key,
          mimeType: params.mimeType,
          sizeBytes: params.sizeBytes,
        }),
      }),
    [],
  );

  // ── Orchestrator ──────────────────────────────────────────────────────────

  /**
   * uploadSelected
   *
   * Runs all three steps in sequence. Returns the selectedImageId from the
   * DB on success; throws (and sets error state) on any failure.
   */
  const uploadSelected = useCallback(
    async (
      requestId: string,
      dataUrl: string,
      mimeType: string,
    ): Promise<{ selectedImageId: string; r2Key: string }> => {
      setIsUploading(true);
      setError(null);

      try {
        const blob = dataUrlToBlob(dataUrl);
        // Derive extension from mimeType — e.g. "image/png" → "png"
        const ext = mimeType.split("/")[1] ?? "png";

        // 1. Get presigned URL
        const { uploadUrl, r2Key } = await presignSelected({
          requestId,
          mimeType,
          ext,
        });

        // 2. PUT blob directly to R2 (no Vercel in the loop)
        await uploadToR2(uploadUrl, blob, mimeType);

        // 3. Register in DB
        const { selectedImageId } = await completeSelected({
          requestId,
          r2Key,
          mimeType,
          sizeBytes: blob.size,
        });

        return { selectedImageId, r2Key };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al subir la imagen.";
        setError(message);
        throw err; // re-throw so the caller can react (e.g. keep Submit enabled)
      } finally {
        setIsUploading(false);
      }
    },
    [presignSelected, uploadToR2, completeSelected],
  );
  // ── Orchestrator: presign + upload only (no DB write) ────────────────────
  //
  // Used by QuoteForm: the binary goes to R2 first, then the form is
  // submitted. The DB write (GeneratedImage + selectedImageId) happens
  // inside POST /api/request/:id/submit-quote together with contact data.

  /**
   * presignAndUpload
   *
   * Runs only steps 1 and 2:
   *   1. POST /api/uploads/presign-selected  → { uploadUrl, r2Key }
   *   2. PUT uploadUrl  (client → R2 direct)
   *
   * Returns { r2Key, mimeType, sizeBytes } so the caller can include them
   * in the submit-quote payload without a separate round-trip.
   */
  const presignAndUpload = useCallback(
    async (
      requestId: string,
      dataUrl: string,
      mimeType: string,
    ): Promise<PresignAndUploadResult> => {
      setIsUploading(true);
      setError(null);

      try {
        const blob = dataUrlToBlob(dataUrl);
        const ext = mimeType.split("/")[1] ?? "png";

        const { uploadUrl, r2Key } = await presignSelected({
          requestId,
          mimeType,
          ext,
        });

        await uploadToR2(uploadUrl, blob, mimeType);

        return { r2Key, mimeType, sizeBytes: blob.size };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al subir la imagen.";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [presignSelected, uploadToR2],
  );

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    isUploading,
    error,
    /** Exposed for composition / progress UI in future iterations */
    presignSelected,
    uploadToR2,
    completeSelected,
    /** Presign + PUT only — no DB write. Use with submit-quote endpoint. */
    presignAndUpload,
    /** Full three-step flow (presign + PUT + DB complete). */
    uploadSelected,
  };
}
