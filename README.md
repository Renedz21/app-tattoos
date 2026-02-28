# Inkyra

**Tattoo Design & Booking, Powered by AI**

Inkyra es una plataforma de diseño y reserva de tatuajes potenciada por inteligencia artificial. Los clientes generan diseños únicos con IA, solicitan cotización y agendan su cita — todo en un solo lugar.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de datos**: PostgreSQL (Neon) via Prisma ORM
- **Auth**: Better Auth (Magic Link)
- **IA**: Google Gemini (AI SDK)
- **Storage**: Cloudflare R2
- **Testing**: Vitest + Playwright

## Desarrollo local

```bash
pnpm install
cp .env.example .env   # completar variables
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la app.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm lint` | Linter (Biome) |
| `pnpm format` | Formatear código (Biome) |

## Estructura

```
app/
├── (admin)/        # Dashboard admin (protegido por Magic Link)
├── (marketing)/    # Landing, generador IA, seguimiento
└── api/            # API routes

lib/
├── config/
│   └── brand.ts    # Constantes de marca centralizadas
├── ai/             # Generación de imágenes con IA
└── r2/             # Cloudflare R2 storage

modules/
├── admin/          # Componentes y lógica del panel admin
├── core/           # Generador IA, componentes UI compartidos
├── landing/        # Hero, Footer, HowItWorks
└── schemas/        # Validación Zod
```

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.
