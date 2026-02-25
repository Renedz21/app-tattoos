export const STYLE_OPTIONS = [
  { value: 'Fine Line', label: 'Fine Line', icon: '✦' },
  { value: 'Blackwork', label: 'Blackwork', icon: '◼' },
  { value: 'Realismo', label: 'Realismo', icon: '◎' },
  { value: 'Tradicional', label: 'Tradicional', icon: '⚓' },
  { value: 'Lettering', label: 'Lettering', icon: '𝐴' },
  { value: 'Minimal', label: 'Minimal', icon: '○' },
] as const;

export const BODY_PARTS = [
  'Antebrazo', 'Brazo', 'Muñeca', 'Hombro', 'Pecho',
  'Espalda', 'Costillas', 'Muslo', 'Tobillo', 'Clavícula',
  'Manga completa', 'Espalda alta',
] as const;

export const SIZE_OPTIONS = [
  { value: 'small', label: 'Pequeño (5-8cm)', description: 'Ideal para muñeca, tobillo' },
  { value: 'medium', label: 'Mediano (10-15cm)', description: 'Ideal para antebrazo, hombro' },
  { value: 'large', label: 'Grande (20cm+)', description: 'Ideal para espalda, muslo, manga' },
] as const;

export const DISTRICTS = [
  'SJL', 'Comas', 'Los Olivos', 'Independencia', 'Carabayllo',
  'Rímac', 'Cercado de Lima', 'Ate', 'Santa Anita', 'El Agustino',
  'San Martín de Porres', 'Puente Piedra', 'Otro',
] as const;

export const AVAILABILITY_OPTIONS = [
  'Mañanas (9am - 12pm)',
  'Tardes (12pm - 5pm)',
  'Noches (5pm - 9pm)',
  'Fines de semana',
  'Flexible',
] as const;
