"use client";

import { Button } from "@/modules/core/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

type Props = {
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function PortfolioDeleteDialog({
  title,
  isDeleting,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onCancel}
      />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl mx-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Trash2 className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="font-bebas text-2xl tracking-wide mb-2">
          Eliminar trabajo
        </h3>
        <p className="text-sm text-muted-foreground font-grotesk mb-6">
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-semibold text-foreground">&quot;{title}&quot;</span>?
          Esta acción eliminará todas las imágenes y no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando…
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
