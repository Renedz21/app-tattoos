"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { CheckCircle2, Copy, Check, MessageCircle, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmationScreenProps {
  requestCode: string;
  trackingToken: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWhatsAppUrl(requestCode: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const msg = encodeURIComponent(
    `Hola! Acabo de enviar mi solicitud de diseño de tatuaje. Mi código es ${requestCode}. ¿Podrían darme más información?`,
  );
  const base = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}`
    : "https://wa.me/";
  return `${base}?text=${msg}`;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

interface CopyButtonProps {
  text: string;
  label: string;
  className?: string;
}

function CopyButton({ text, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "¡Copiado!" : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        copied
          ? "bg-emerald-500/15 text-emerald-500"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        className,
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ConfirmationScreen
 *
 * Shown after a successful submit-quote call. Displays:
 *  - A success icon and headline.
 *  - The human-readable requestCode (ZT-XXXX).
 *  - A copiable tracking URL (/seguimiento/<requestCode>) — human-readable
 *    and reconstructible from the code alone. The page also accepts the
 *    trackingToken so existing long-form links keep working.
 *  - A "Seguir por WhatsApp" button (opens wa.me with a pre-filled message).
 *  - A "Ver seguimiento" link that navigates to the tracking page.
 *
 * Pure presentational — all data comes from props.
 */
export default function ConfirmationScreen({
  requestCode,
  trackingToken,
}: ConfirmationScreenProps) {
  // Use the human-readable requestCode in the URL so the user can
  // reconstruct it from their code alone. The page also accepts
  // trackingToken, so old links remain valid.
  const trackingPath = `/seguimiento/${requestCode}`;
  const trackingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${trackingPath}`
      : trackingPath;

  const whatsappUrl = buildWhatsAppUrl(requestCode);

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      {/* ── Success icon ────────────────────────────────────────────────── */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>

      {/* ── Headline ────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <h3 className="font-bebas text-4xl tracking-wide">
          ¡Solicitud enviada!
        </h3>
        <p className="font-grotesk text-sm text-muted-foreground max-w-xs mx-auto">
          Recibimos tu diseño. Pronto nos pondremos en contacto contigo con la
          cotización.
        </p>
      </div>

      {/* ── Request code card ───────────────────────────────────────────── */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 space-y-4 text-left shadow-sm">
        {/* Code */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="font-grotesk text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Código de solicitud
            </p>
            <p className="font-bebas text-3xl tracking-widest text-primary">
              {requestCode}
            </p>
          </div>
          <CopyButton text={requestCode} label="Copiar código de solicitud" />
        </div>

        <div className="h-px bg-border" />

        {/* Tracking link */}
        <div className="space-y-1.5">
          <p className="font-grotesk text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Enlace de seguimiento
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-grotesk text-xs text-foreground truncate min-w-0">
              {trackingUrl}
            </p>
            <CopyButton
              text={trackingUrl}
              label="Copiar enlace de seguimiento"
              className="shrink-0"
            />
          </div>
        </div>
      </div>

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {/* WhatsApp */}
        <Button
          asChild
          className="w-full font-grotesk font-semibold bg-[#25D366] hover:bg-[#1ebe5d] text-white"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Seguir por WhatsApp
          </a>
        </Button>

        {/* Tracking page */}
        <Button asChild variant="outline" className="w-full font-grotesk">
          <Link href={trackingPath}>
            <Eye className="h-4 w-4" />
            Ver seguimiento
          </Link>
        </Button>
      </div>

      {/* ── Footer note ─────────────────────────────────────────────────── */}
      <p className="font-grotesk text-xs text-muted-foreground max-w-xs">
        Guarda tu código{" "}
        <strong className="text-foreground">{requestCode}</strong> para
        consultar el estado de tu solicitud en cualquier momento.
      </p>
    </div>
  );
}
