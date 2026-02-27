"use client";

import {
  ColorMode,
  RequestStatus,
  TattooSize,
  TattooStyle,
} from "@/lib/generated/prisma/enums";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

export const getStyleLabel = (style: TattooStyle) => {
  switch (style) {
    case TattooStyle.BLACKWORK:
      return "Blackwork";
    case TattooStyle.FINE_LINE:
      return "Fine Line";
    case TattooStyle.LETTERING:
      return "Lettering";
    case TattooStyle.MINIMAL:
      return "Minimal";
    case TattooStyle.OTHER:
      return "Otro";
    case TattooStyle.REALISM:
      return "Realismo";
    case TattooStyle.TRADITIONAL:
      return "Tradicional";
    default:
      return "Desconocido";
  }
};

export const getStatusLabel = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.APPOINTMENT_CONFIRMED:
      return "Reserva Confirmada";
    case RequestStatus.DEPOSIT_PENDING:
      return "Deposito Pendiente";
    case RequestStatus.EXPIRED:
      return "Vencido";
    case RequestStatus.FINISHED:
      return "Finalizado";
    case RequestStatus.QUOTED:
      return "Cotizado";
    case RequestStatus.SENT:
      return "Enviado";
    default:
      return "Desconocido";
  }
};

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type RequestTattoo = {
  status: RequestStatus | null;
  requestCode: string | null;
  style: TattooStyle;
  fullName: string | null;
  sentAt: Date | null;
  createdAt: Date;
};

export const columns: ColumnDef<RequestTattoo>[] = [
  {
    accessorKey: "requestCode",
    header: "Código",
    cell: ({ row }) => {
      const value = row.original;
      return (
        <Link href={`/admin/lead/${value.requestCode}`}>
          {value.requestCode ?? "N/A"}
        </Link>
      );
    },
  },
  {
    accessorKey: "fullName",
    header: "Nombre",
  },
  {
    accessorKey: "style",
    header: "Estilo",
    cell: ({ row }) => {
      const style = row.getValue("style");
      const label = getStyleLabel(style as TattooStyle);
      return label;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const label = getStatusLabel(status as RequestStatus);
      return label;
    },
  },
  {
    accessorKey: "sentAt",
    header: "Fecha",
    cell: ({ row }) => {
      const date = row.getValue<Date | null>("sentAt");
      return date ? format(new Date(date), "dd-MM-yyyy") : "N/A";
    },
  },
  {
    accessorKey: "priceCents",
    header: "Precio",
    cell: ({ row }) => {
      const price = row.getValue<number | null>("priceCents");
      return price ? `S/ ${price}` : "---";
    },
  },
];
