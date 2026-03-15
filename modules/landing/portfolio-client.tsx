"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STYLE_LABELS } from "@/lib/labels";
import { TattooStyle } from "@/lib/generated/prisma/enums";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type PortfolioImage = {
  id: string;
  publicUrl: string | null;
  sortOrder: number;
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  style: TattooStyle;
  bodyZone: string | null;
  colorMode: string;
  images: PortfolioImage[];
};

type Props = {
  items: PortfolioItem[];
};

const STYLE_ORDER = Object.values(TattooStyle);

export default function PortfolioClient({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState<TattooStyle | null>(null);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const availableStyles = useMemo(() => {
    const set = new Set(items.map((i) => i.style));
    return STYLE_ORDER.filter((s) => set.has(s));
  }, [items]);

  const filtered = useMemo(
    () =>
      activeFilter ? items.filter((i) => i.style === activeFilter) : items,
    [items, activeFilter],
  );

  const openLightbox = (item: PortfolioItem) => {
    setLightboxItem(item);
    setLightboxIndex(0);
  };

  const closeLightbox = useCallback(() => {
    setLightboxItem(null);
  }, []);

  useEffect(() => {
    if (!lightboxItem) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight" && lightboxItem)
        setLightboxIndex((i) =>
          Math.min(lightboxItem.images.length - 1, i + 1),
        );
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxItem, closeLightbox]);

  return (
    <>
      {/* Filter chips */}
      {availableStyles.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-grotesk transition-colors ${
              activeFilter === null
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {availableStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === style ? null : style)
              }
              className={`rounded-full px-4 py-1.5 text-sm font-grotesk transition-colors ${
                activeFilter === style
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {filtered.map((item) => {
          const thumb = item.images[0];
          const styleLabel = STYLE_LABELS[item.style];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(item)}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 text-left transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="aspect-square w-full overflow-hidden">
                {thumb?.publicUrl ? (
                  <LazyImage
                    src={thumb.publicUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-ink-medium">
                    <span className="font-bebas text-5xl text-muted-foreground/30">
                      {styleLabel.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bebas text-base tracking-wide truncate">
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground font-grotesk">
                  {styleLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground font-grotesk py-12">
          No hay trabajos en esta categoría aún.
        </p>
      )}

      {/* Lightbox */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeLightbox}
          />
          <div className="relative z-10 flex flex-col items-center max-w-4xl w-full mx-4">
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="relative w-full flex items-center justify-center">
              {lightboxItem.images.length > 1 && lightboxIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex((i) => i - 1)}
                  className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div className="overflow-hidden rounded-xl max-h-[80vh]">
                {lightboxItem.images[lightboxIndex]?.publicUrl ? (
                  <img
                    src={lightboxItem.images[lightboxIndex].publicUrl!}
                    alt={lightboxItem.title}
                    className="max-h-[80vh] w-auto object-contain"
                  />
                ) : (
                  <div className="flex h-96 w-96 items-center justify-center bg-ink-medium rounded-xl">
                    <span className="font-bebas text-6xl text-muted-foreground/30">
                      {STYLE_LABELS[lightboxItem.style].charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {lightboxItem.images.length > 1 &&
                lightboxIndex < lightboxItem.images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((i) => i + 1)}
                    className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="font-bebas text-2xl text-white tracking-wide">
                {lightboxItem.title}
              </h3>
              <p className="text-sm text-white/60 font-grotesk">
                {STYLE_LABELS[lightboxItem.style]}
                {lightboxItem.bodyZone
                  ? ` — ${lightboxItem.bodyZone}`
                  : ""}
              </p>
              {lightboxItem.images.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                  {lightboxItem.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        idx === lightboxIndex
                          ? "bg-primary"
                          : "bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LazyImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-ink-medium animate-pulse" />
      )}
    </div>
  );
}
