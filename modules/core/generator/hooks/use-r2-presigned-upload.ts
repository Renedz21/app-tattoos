import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export type PresignAndUploadResult = {
  r2Key: string;
  mimeType: string;
  sizeBytes: number;
};

type PresignResponse = {
  uploadUrl: string;
  r2Key: string;
};

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

export function useR2PresignedUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presignSelected = useCallback(
    (params: { requestId: string; mimeType: string; ext: string }) =>
      api<PresignResponse>("/api/uploads/presign-selected", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    [],
  );

  const uploadToR2 = useCallback(
    async (uploadUrl: string, blob: Blob, mimeType: string): Promise<void> => {
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

  return {
    isUploading,
    error,
    presignAndUpload,
  };
}
