"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { PreviewItem } from "../hooks/use-tattoo-generation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewGalleryProps {
  /** All generated previews in creation order. */
  previews: PreviewItem[];
  /** Id of the currently selected preview (shown in the large viewer). */
  selectedId: string | null;
  /** Called when the user clicks a thumbnail. */
  onSelect: (id: string) => void;
  /** Whether the user can still generate another preview. */
  canAdd: boolean;
  /** Called when the user clicks the "+" button to generate a new preview. */
  onAdd: () => void;
  /** Disables all interactions (e.g. while generating or uploading). */
  disabled?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THUMB_SIZE = "size-16 sm:size-20";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PreviewGallery
 *
 * Horizontal strip of circular thumbnails representing each AI-generated
 * preview. Matches the reference screenshot:
 *   - Circular images with object-cover.
 *   - Selected thumbnail has a prominent primary-colored ring.
 *   - A "+" button at the end lets the user trigger another generation
 *     (hidden/disabled when the attempt cap is reached).
 *
 * Pure presentational — all state lives in useTattooGeneration.
 */
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

              {/* Subtle overlay on hover for non-selected items */}
              {!isSelected && (
                <div className="absolute inset-0 rounded-full bg-background/20 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          );
        })}

        {/* Add button — visible only when more attempts are available */}
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
