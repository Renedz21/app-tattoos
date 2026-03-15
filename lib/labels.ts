import {
  ColorMode,
  RequestStatus,
  TattooSize,
  TattooStyle,
} from "@/lib/generated/prisma/enums";

export const STYLE_LABELS: Record<TattooStyle, string> = {
  [TattooStyle.FINE_LINE]: "Fine Line",
  [TattooStyle.BLACKWORK]: "Blackwork",
  [TattooStyle.REALISM]: "Realismo",
  [TattooStyle.TRADITIONAL]: "Tradicional",
  [TattooStyle.LETTERING]: "Lettering",
  [TattooStyle.MINIMAL]: "Minimalista",
  [TattooStyle.OTHER]: "Otro",
};

export function getStyleLabel(style: TattooStyle): string {
  return STYLE_LABELS[style] ?? "Desconocido";
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.SENT]: "Enviado",
  [RequestStatus.QUOTED]: "Cotizado",
  [RequestStatus.APPOINTMENT_CONFIRMED]: "Cita confirmada",
  [RequestStatus.FINISHED]: "Finalizado",
  [RequestStatus.EXPIRED]: "Expirado",
};

export function getStatusLabel(status: RequestStatus): string {
  return STATUS_LABELS[status] ?? "Desconocido";
}

export const SIZE_LABELS: Record<TattooSize, string> = {
  [TattooSize.SMALL]: "Pequeño",
  [TattooSize.MEDIUM]: "Mediano",
  [TattooSize.LARGE]: "Grande",
  [TattooSize.OTHER]: "Otro",
};

export function getSizeLabel(size: TattooSize): string {
  return SIZE_LABELS[size] ?? "Desconocido";
}

export const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  [ColorMode.BLACK_AND_GREY]: "Blanco y Negro",
  [ColorMode.COLOR]: "Color",
};

export function getColorModeLabel(mode: ColorMode): string {
  return COLOR_MODE_LABELS[mode] ?? "Desconocido";
}
