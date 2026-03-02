import Link from "next/link";
import { Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-gradient-to-b from-background via-background to-ink-medium" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container relative z-10 flex flex-col items-center gap-8 px-4 lg:pt-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Anímate a hacer tu primer tatuaje
        </div>

        <h1 className="max-w-4xl font-bebas text-5xl leading-[0.95] tracking-wide sm:text-7xl md:text-8xl lg:text-9xl">
          Tu próximo tatuaje{" "}
          <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
            empieza con una idea
          </span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground font-grotesk leading-relaxed md:text-xl">
          Diseña tu tatuaje ideal con inteligencia artificial, solicita tu
          cotización y agenda tu cita. Todo en un solo lugar.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/generator">
            <Button
              size="lg"
              className="gap-2 px-8 py-6 text-base font-grotesk font-semibold shadow-tertiary"
            >
              <Sparkles size={18} />
              Generar idea con IA
            </Button>
          </Link>
          <a href="#portafolio">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8 py-6 text-base font-grotesk font-semibold border-border/60 hover:border-primary/40"
            >
              Ver trabajos reales
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
