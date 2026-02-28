import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-ink-light">
      <div className="container mx-auto px-4 py-12 md:py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <span className="font-bebas text-3xl tracking-wider bg-linear-to-r from-primary to-tertiary text-transparent bg-clip-text">
              ZTATOOS
            </span>
            <p className="mt-3 text-sm text-muted-foreground font-grotesk max-w-xs leading-relaxed">
              Estudio de tatuajes premium en San Juan de Lurigancho. Tu idea,
              nuestra tinta.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bebas text-lg tracking-wide mb-4">
              Navegación
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="#portafolio"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                Portafolio
              </a>
              <Link
                href="/generator"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                Generar idea con IA
              </Link>
              <a
                href="#como-funciona"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                Cómo funciona
              </a>
              <a
                href="#ubicacion"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                Ubicación
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bebas text-lg tracking-wide mb-4">Síguenos</h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/51999888777"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-grotesk"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/30  text-center text-xs text-muted-foreground/60 font-grotesk">
          © {new Date().getFullYear()} ZTatoos. Todos los derechos reservados.
          Lima, Perú.
        </div>
      </div>
    </footer>
  );
}
