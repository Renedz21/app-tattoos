import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, CheckCircle2, Clock, Circle } from "lucide-react";
import {
  RequestStatus,
  TattooStyle,
  TattooSize,
} from "@/lib/generated/prisma/enums";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type TimelineEvent = {
  key: string;
  label: string;
  description: string;
  doneAt: Date | null;
};

function buildTimeline(tr: {
  sentAt: Date | null;
  quotedAt: Date | null;
  depositSubmittedAt: Date | null;
  depositConfirmedAt: Date | null;
  appointmentAt: Date | null;
  finishedAt: Date | null;
}): TimelineEvent[] {
  return [
    {
      key: "sent",
      label: "Solicitud recibida",
      description:
        "Tu diseño y datos de contacto fueron enviados correctamente.",
      doneAt: tr.sentAt,
    },
    {
      key: "quoted",
      label: "Cotización enviada",
      description: "Te enviamos la cotización por WhatsApp.",
      doneAt: tr.quotedAt,
    },
    {
      key: "deposit_submitted",
      label: "Depósito registrado",
      description: "Registramos tu comprobante de depósito.",
      doneAt: tr.depositSubmittedAt,
    },
    {
      key: "deposit_confirmed",
      label: "Depósito confirmado",
      description: "Tu pago fue confirmado. ¡Ya estás en la agenda!",
      doneAt: tr.depositConfirmedAt,
    },
    {
      key: "appointment",
      label: "Cita programada",
      description: "Tu sesión de tatuaje está confirmada.",
      doneAt: tr.appointmentAt,
    },
    {
      key: "finished",
      label: "Tatuaje completado",
      description: "¡Tu diseño cobró vida! Gracias por confiar en nosotros.",
      doneAt: tr.finishedAt,
    },
  ];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.SENT]: "Solicitud enviada",
  [RequestStatus.QUOTED]: "Cotización enviada",
  [RequestStatus.DEPOSIT_PENDING]: "Esperando depósito",
  [RequestStatus.APPOINTMENT_CONFIRMED]: "Cita confirmada",
  [RequestStatus.FINISHED]: "Completado",
  [RequestStatus.EXPIRED]: "Expirado",
};

const STYLE_LABELS: Record<TattooStyle, string> = {
  [TattooStyle.FINE_LINE]: "Fine Line",
  [TattooStyle.BLACKWORK]: "Blackwork",
  [TattooStyle.REALISM]: "Realismo",
  [TattooStyle.TRADITIONAL]: "Tradicional",
  [TattooStyle.LETTERING]: "Lettering",
  [TattooStyle.MINIMAL]: "Minimalista",
  [TattooStyle.OTHER]: "Otro",
};

const SIZE_LABELS: Record<TattooSize, string> = {
  [TattooSize.SMALL]: "Pequeño",
  [TattooSize.MEDIUM]: "Mediano",
  [TattooSize.LARGE]: "Grande",
  [TattooSize.OTHER]: "Otro",
};

function StatusBadge({ status }: { status: RequestStatus }) {
  const isActive = (
    [
      RequestStatus.SENT,
      RequestStatus.QUOTED,
      RequestStatus.DEPOSIT_PENDING,
      RequestStatus.APPOINTMENT_CONFIRMED,
    ] as RequestStatus[]
  ).includes(status);
  const isFinished = status === RequestStatus.FINISHED;
  const isExpired = status === RequestStatus.EXPIRED;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-grotesk",
        isFinished
          ? "bg-emerald-500/15 text-emerald-500"
          : isExpired
            ? "bg-destructive/15 text-destructive"
            : isActive
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isFinished
            ? "bg-emerald-500"
            : isExpired
              ? "bg-destructive"
              : isActive
                ? "bg-primary animate-pulse"
                : "bg-muted-foreground",
        ].join(" ")}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface TimelineStepProps {
  event: TimelineEvent;
  isLast: boolean;
}

function TimelineStep({ event, isLast }: TimelineStepProps) {
  const isDone = event.doneAt !== null;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isDone
              ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
              : "border-border bg-card text-muted-foreground",
          ].join(" ")}
        >
          {isDone ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
        </div>
        {!isLast && (
          <div
            className={[
              "mt-1 w-px flex-1",
              isDone ? "bg-emerald-500/40" : "bg-border",
            ].join(" ")}
            style={{ minHeight: "2rem" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-8 min-w-0">
        <p
          className={[
            "font-grotesk text-sm font-semibold leading-tight",
            isDone ? "text-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          {event.label}
        </p>
        <p className="font-grotesk text-xs text-muted-foreground mt-0.5">
          {event.description}
        </p>
        {isDone && (
          <p className="font-grotesk text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(event.doneAt!)}
          </p>
        )}
      </div>
    </div>
  );
}

const select = {
  requestCode: true,
  trackingToken: true,
  status: true,
  style: true,
  bodyZone: true,
  size: true,
  colorMode: true,
  detailLevel: true,
  fullName: true,
  district: true,
  availability: true,
  sentAt: true,
  quotedAt: true,
  depositSubmittedAt: true,
  depositConfirmedAt: true,
  appointmentAt: true,
  finishedAt: true,
  createdAt: true,
  selectedImagePublicUrl: true,
} as const;
async function findRequest(slug: string) {
  // 1st attempt: treat slug as trackingToken
  const byToken = await prisma.tattooRequest.findUnique({
    where: { trackingToken: slug },
    select,
  });
  if (byToken) return byToken;

  // 2nd attempt: treat slug as requestCode (ZT-XXXX)
  const byCode = await prisma.tattooRequest.findUnique({
    where: { requestCode: slug },
    select,
  });
  return byCode ?? null;
}

export default async function SeguimientoPage({ params }: PageProps) {
  const { slug } = await params;

  const tr = await findRequest(slug);
  if (!tr) {
    notFound();
  }

  const timeline = buildTimeline(tr);
  const completedSteps = timeline.filter((e) => e.doneAt !== null).length;

  return (
    <div className="min-h-dvh py-8">
      <div className="container mx-auto max-w-2xl space-y-8">
        {/* ── Back link ───────────────────────────────────────────────── */}
        <Link
          href="/generator"
          className="inline-flex items-center gap-1.5 font-grotesk text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Nuevo diseño
        </Link>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-bebas text-4xl tracking-wide">
              Seguimiento de solicitud
            </h1>
            {tr.requestCode && (
              <span className="font-bebas text-2xl tracking-widest text-primary">
                {tr.requestCode}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {tr.status && <StatusBadge status={tr.status} />}
            <span className="font-grotesk text-xs text-muted-foreground">
              {completedSteps} de {timeline.length} etapas completadas
            </span>
          </div>
        </div>

        {/* ── Design image ────────────────────────────────────────────── */}
        {tr.selectedImagePublicUrl ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <img
              src={tr.selectedImagePublicUrl}
              alt="Diseño de tatuaje seleccionado"
              className="h-auto w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50">
            <p className="font-grotesk text-sm text-muted-foreground">
              Imagen no disponible aún
            </p>
          </div>
        )}

        {/* ── Request details ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-bebas text-xl tracking-wide">
            Detalles del diseño
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {[
              { label: "Estilo", value: STYLE_LABELS[tr.style] },
              { label: "Zona", value: tr.bodyZone },
              { label: "Tamaño", value: SIZE_LABELS[tr.size] },
              {
                label: "Color",
                value: tr.colorMode === "COLOR" ? "Color" : "Blanco y negro",
              },
              {
                label: "Detalle",
                value: `${tr.detailLevel} / 5`,
              },
              tr.fullName ? { label: "Solicitante", value: tr.fullName } : null,
              tr.district ? { label: "Distrito", value: tr.district } : null,
              tr.availability
                ? { label: "Disponibilidad", value: tr.availability }
                : null,
            ]
              .filter(Boolean)
              .map((item) => (
                <div key={item!.label} className="space-y-0.5">
                  <dt className="font-grotesk text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item!.label}
                  </dt>
                  <dd className="font-grotesk text-sm text-foreground">
                    {item!.value}
                  </dd>
                </div>
              ))}
          </dl>
        </div>

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-bebas text-xl tracking-wide">
            Estado del proceso
          </h2>
          <div className="pt-2">
            {timeline.map((event, index) => (
              <TimelineStep
                key={event.key}
                event={event}
                isLast={index === timeline.length - 1}
              />
            ))}
          </div>
        </div>

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <p className="font-grotesk text-xs text-center text-muted-foreground pb-8">
          Guarda esta URL para consultar el estado de tu solicitud en cualquier
          momento.
          {tr.requestCode && (
            <>
              {" "}
              Código:{" "}
              <strong className="text-foreground">{tr.requestCode}</strong>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
