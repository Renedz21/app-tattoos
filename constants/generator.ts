export const STYLE_OPTIONS = [
  { value: "COVER_UP", label: "Cover Up", icon: "↺" },
  { value: "RELIGIOUS", label: "Religiosos", icon: "✝" },
  { value: "PERSONALIZED", label: "Personalizados", icon: "✏" },
  { value: "DOTWORK", label: "Puntillismo", icon: "⠿" },
  { value: "SURREALISM", label: "Rarismo", icon: "◌" },
  { value: "MISCELLANEOUS", label: "Misceláneas", icon: "◈" },
  { value: "WATERCOLOR", label: "Water Color", icon: "◇" },
  { value: "GEOMETRIC", label: "Geométricos", icon: "△" },
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
