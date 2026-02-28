"use client";

import { getStatusLabel, getStyleLabel } from "@/lib/labels";
import { RequestStatus, TattooStyle } from "@/lib/generated/prisma/enums";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

// This type is used to define the shape of our data.
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
    cell: ({ row }) => getStyleLabel(row.getValue("style") as TattooStyle),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue<RequestStatus | null>("status");
      return status ? getStatusLabel(status) : "—";
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
