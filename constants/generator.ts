export const STYLE_OPTIONS = [
  { value: "FINE_LINE", label: "Fine Line", icon: "✦" },
  { value: "BLACKWORK", label: "Blackwork", icon: "◼" },
  { value: "REALISM", label: "Realismo", icon: "◎" },
  { value: "TRADITIONAL", label: "Tradicional", icon: "⚓" },
  { value: "LETTERING", label: "Lettering", icon: "𝐴" },
  { value: "MINIMAL", label: "Minimal", icon: "○" },
] as const;

export const BODY_PARTS = [
  "Antebrazo",
  "Brazo",
  "Muñeca",
  "Hombro",
  "Pecho",
  "Espalda",
  "Costillas",
  "Muslo",
  "Tobillo",
  "Clavícula",
  "Manga completa",
  "Espalda alta",
] as const;

export const SIZE_OPTIONS = [
  {
    value: "SMALL",
    label: "Pequeño (5-8cm)",
    description: "Ideal para muñeca, tobillo",
  },
  {
    value: "MEDIUM",
    label: "Mediano (10-15cm)",
    description: "Ideal para antebrazo, hombro",
  },
  {
    value: "LARGE",
    label: "Grande (20cm+)",
    description: "Ideal para espalda, muslo, manga",
  },
] as const;

export const COLOR_OPTIONS = [
  {
    value: "BLACK_AND_GREY",
    label: "Blanco y Negro",
  },
  {
    value: "COLOR",
    label: "Color",
  },
] as const;

export const DISTRICTS = [
  "SJL",
  "Comas",
  "Los Olivos",
  "Independencia",
  "Carabayllo",
  "Rímac",
  "Cercado de Lima",
  "Ate",
  "Santa Anita",
  "El Agustino",
  "San Martín de Porres",
  "Puente Piedra",
  "Otro",
] as const;

export const AVAILABILITY_OPTIONS = [
  "Mañanas (9am - 12pm)",
  "Tardes (12pm - 5pm)",
  "Noches (5pm - 9pm)",
  "Fines de semana",
  "Flexible",
] as const;
