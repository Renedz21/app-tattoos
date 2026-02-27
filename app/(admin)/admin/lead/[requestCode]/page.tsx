import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import AdminEditForm from "@/modules/admin/components/admin-edit-form";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { Label } from "@/modules/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { Separator } from "@/modules/core/components/ui/separator";
import { Textarea } from "@/modules/core/components/ui/textarea";
import { format } from "date-fns";
import { ArrowLeft, MessageCircle, Phone, Save } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{
    requestCode: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { requestCode } = await params;

  const lead = await prisma.tattooRequest.findFirst({
    where: {
      requestCode,
    },
  });

  console.log(lead);

  return (
    <>
      <div className="flex flex-col gap-8">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Volver al dashboard
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-grotesk text-2xl tracking-tight text-foreground">
              {lead?.fullName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="text-xs text-primary">{lead?.requestCode}</span>
              <span>{lead?.district}</span>
              <span>
                {lead?.createdAt &&
                  format(new Date(lead?.createdAt), "dd MMMM yyyy")}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-sm border-border/50 text-foreground"
            >
              <a
                href={`https://wa.me/${lead?.whatsappE164}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-sm border-border/50 text-foreground"
            >
              <a href={`tel:${lead?.whatsappE164}`}>
                <Phone className="size-4" />
                Llamar
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-sm border border-border/30 bg-card p-6">
              <h2 className="mb-4 text-xs tracking-widest uppercase text-primary font-medium">
                Diseño del cliente
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-sm border border-border/20">
                  <img
                    src={
                      lead?.selectedImagePublicUrl
                        ? lead?.selectedImagePublicUrl
                        : ""
                    }
                    alt="Diseño generado"
                    width={400}
                    height={400}
                    className="w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estilo</span>
                    <span className="text-foreground">{lead?.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zona</span>
                    <span className="text-foreground">{lead?.bodyZone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tamaño</span>
                    <span className="text-foreground">{lead?.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color</span>
                    <span className="text-foreground">
                      {lead?.colorMode === "BLACK_AND_GREY"
                        ? "Blanco y Negro"
                        : "Color"}
                    </span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Disponibilidad
                    </span>
                    <span className="text-foreground text-right max-w-[50%]">
                      {lead?.availability || "No especificada"}
                    </span>
                  </div>
                  {lead?.extraComments && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Comentarios</span>
                      <p className="text-foreground">{lead?.extraComments}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quotation / Edit*/}
            <div className="rounded-sm border border-border/30 bg-card p-6">
              <h2 className="mb-4 text-xs tracking-widest uppercase text-primary font-medium">
                Cotización y estado
              </h2>

              <AdminEditForm defaultValues={lead} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Status badge */}
            <div className="rounded-sm border border-border/30 bg-card p-5">
              <h3 className="mb-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                Estado actual
              </h3>
              <span className="inline-flex items-center rounded-sm px-3 py-1.5 text-sm font-medium bg-primary/50">
                {lead?.status}
              </span>
            </div>

            {/* Timeline summary */}
            <div className="rounded-sm border border-border/30 bg-card p-5">
              <h3 className="mb-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                Historial
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado</span>
                  <span className="text-foreground text-xs">
                    {lead?.createdAt &&
                      format(new Date(lead?.createdAt), "dd-MM-yyyy, HH:mm")}
                  </span>
                </div>
                {lead?.quotedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cotizado</span>
                    <span className="text-foreground text-xs">
                      {format(new Date(lead?.quotedAt), "dd-MM-yyyy, HH:mm")}
                    </span>
                  </div>
                )}
                {lead?.depositConfirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seña pagada</span>
                    <span className="text-foreground text-xs">
                      {format(
                        new Date(lead?.depositConfirmedAt),
                        "dd-MM-yyyy, HH:mm",
                      )}
                    </span>
                  </div>
                )}
                {lead?.appointmentAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cita</span>
                    <span className="text-foreground text-xs">
                      {format(
                        new Date(lead?.appointmentAt),
                        "dd-MM-yyyy, HH:mm",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-sm border border-border/30 bg-card p-5">
              <h3 className="mb-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                Acciones rápidas
              </h3>
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start rounded-sm border-border/50 text-foreground"
                >
                  <Link href={`/seguimiento/${lead?.requestCode}`}>
                    Ver página del cliente
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start rounded-sm border-border/50 text-foreground"
                >
                  <a
                    href={`https://wa.me/${lead?.whatsappE164}?text=Hola ${lead?.fullName}, te escribimos de SJL Ink Studio respecto a tu solicitud ${lead?.id}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    Enviar cotización por WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
