"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/modules/core/components/ui/button";
import { X, Menu } from "lucide-react";
import { APP_NAME } from "@/lib/config/brand";

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <Link
          href="/"
          className="font-bebas text-4xl tracking-wider bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent"
        >
          {APP_NAME}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#portafolio"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground font-grotesk"
          >
            Portafolio
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground font-grotesk"
          >
            Cómo funciona
          </a>
          <a
            href="#ubicacion"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground font-grotesk"
          >
            Ubicación
          </a>
          <Link href="/generator">
            <Button size="sm" className="font-grotesk font-medium">
              Generar idea con IA
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="container mx-auto flex flex-col gap-4 py-6 px-4 lg:px-6">
            <a
              href="#portafolio"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground font-grotesk"
            >
              Portafolio
            </a>
            <a
              href="#como-funciona"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground font-grotesk"
            >
              Cómo funciona
            </a>
            <a
              href="#ubicacion"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground font-grotesk"
            >
              Ubicación
            </a>
            <Button
              size="sm"
              className="w-full font-grotesk font-semibold"
              asChild
            >
              <Link href="/generator" onClick={() => setOpen(false)}>
                Generar idea con IA
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
