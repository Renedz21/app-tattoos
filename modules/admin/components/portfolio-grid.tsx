"use client";

import { Card, CardContent } from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { STYLE_LABELS } from "@/lib/labels";
import { Pencil, Trash2, EyeOff } from "lucide-react";
import type { TattooStyle } from "@/lib/generated/prisma/enums";

export type PortfolioItemWithImages = {
  id: string;
  title: string;
  description: string | null;
  style: TattooStyle;
  bodyZone: string | null;
  colorMode: string;
  isPublished: boolean;
  sortOrder: number;
  images: {
    id: string;
    r2Key: string;
    publicUrl: string | null;
    sortOrder: number;
  }[];
};

type Props = {
  items: PortfolioItemWithImages[];
  onEdit: (item: PortfolioItemWithImages) => void;
  onDelete: (item: PortfolioItemWithImages) => void;
};

export default function PortfolioGrid({ items, onEdit, onDelete }: Props) {
  return (
    <div>
      <p className="text-sm text-muted-foreground font-grotesk mb-4">
        {items.length} {items.length === 1 ? "trabajo" : "trabajos"}
      </p>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const thumb = item.images[0];
          const styleLabel = STYLE_LABELS[item.style] ?? item.style;

          return (
            <Card
              key={item.id}
              className="group relative overflow-hidden border-border/50 bg-card/50"
            >
              {!item.isPublished && (
                <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-0.5 text-xs font-medium text-black">
                  <EyeOff size={12} />
                  Oculto
                </span>
              )}
              <div className="aspect-square w-full overflow-hidden bg-ink-medium">
                {thumb?.publicUrl ? (
                  <img
                    src={thumb.publicUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-bebas text-5xl text-muted-foreground/30">
                      {styleLabel.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bebas text-lg tracking-wide truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground font-grotesk">
                  {styleLabel}
                  {item.bodyZone ? ` — ${item.bodyZone}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil size={14} />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
