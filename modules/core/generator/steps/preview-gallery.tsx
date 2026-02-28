"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { PreviewItem } from "../hooks/use-tattoo-generation";
interface PreviewGalleryProps {
  previews: PreviewItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  canAdd: boolean;
  onAdd: () => void;
  disabled?: boolean;
}

const THUMB_SIZE = "size-16 sm:size-20";

export default function PreviewGallery({
  previews,
  selectedId,
  onSelect,
  canAdd,
  onAdd,
  disabled = false,
}: PreviewGalleryProps) {
  if (previews.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-bebas text-lg tracking-wide text-foreground">
        Tus generaciones
      </h4>

      <div className="flex items-center gap-3">
        {previews.map((preview, index) => {
          const isSelected = preview.id === selectedId;

          return (
            <button
              key={preview.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(preview.id)}
              aria-label={`Seleccionar diseño ${index + 1}`}
              aria-pressed={isSelected}
              className={cn(
                "group relative shrink-0 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                THUMB_SIZE,
                isSelected
                  ? "ring-[3px] ring-primary ring-offset-2 ring-offset-background"
                  : "ring-1 ring-border opacity-70 hover:opacity-100",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <img
                src={preview.dataUrl}
                alt={`Diseño generado ${index + 1}`}
                className="h-full w-full rounded-full object-cover"
                draggable={false}
              />
              {!isSelected && (
                <div className="absolute inset-0 rounded-full bg-background/20 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          );
        })}
        {canAdd && (
          <button
            type="button"
            disabled={disabled}
            onClick={onAdd}
            aria-label="Generar nuevo diseño"
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-all hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              THUMB_SIZE,
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
