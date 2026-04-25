# Brota 🌱

> **Cuida, observa, brota.**
> Asistente inteligente para el cuidado de plantas del hogar.

Brota es una app personal que ayuda a recordar riegos, llevar fichas por especie, registrar el historial de cuidados y diagnosticar la salud de las plantas mediante IA. Pensada para 2 usuarios (uso doméstico), con dashboard web y experiencia móvil instalable como PWA.

> Para una visión completa del proyecto, decisiones técnicas y roadmap consulta [`CLAUDE.md`](./CLAUDE.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Lenguaje | TypeScript estricto |
| UI | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix + Nova) |
| Tipografía | [Manrope](https://fonts.google.com/specimen/Manrope) (cuerpo) + [Noto Serif](https://fonts.google.com/specimen/Noto+Serif) (titulares) |
| Iconos | [Lucide](https://lucide.dev) |
| Auth | [NextAuth v5](https://authjs.dev) (CredentialsProvider + JWT) |
| Validación | [Zod](https://zod.dev) |
| ORM | [Prisma 7](https://www.prisma.io) (adapter `@prisma/adapter-pg`) |
| Base de datos | [Neon](https://neon.tech) (PostgreSQL serverless) |
| IA — identificación + ficha | Gemini 2.5 Flash *(pendiente de integrar)* |
| IA — diagnóstico | Claude Sonnet 4.6 *(pendiente de integrar)* |
| Almacenamiento de imágenes | [Vercel Blob](https://vercel.com/storage/blob) *(pendiente de integrar)* |
| Hosting previsto | [Vercel](https://vercel.com) |

---

## Requisitos previos

- **Node.js 18+** (probado con Node 24).
- **Una base de datos PostgreSQL accesible.** Recomendado: cuenta gratuita en [Neon](https://console.neon.tech).
- Conexión a internet (para Neon, fuentes de Google y futuras llamadas a IA).

---

## Setup local

```bash
git clone https://github.com/Gankrdev/brota.git
cd brota
npm install
```

### Variables de entorno

Copia el template y rellena con tus valores:

```bash
cp .env.example .env
```

Variables mínimas para arrancar la app y autenticarte:

| Variable | De dónde |
|---|---|
| `DATABASE_URL` | [Neon dashboard](https://console.neon.tech) → Connection string (pooled) |
| `AUTH_SECRET` | Genera con `npx auth secret` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | Credenciales del usuario administrador |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` / `SEED_USER_NAME` | Credenciales del segundo usuario |

Las claves de IA (`GOOGLE_GENAI_API_KEY`, `ANTHROPIC_API_KEY`), Vercel Blob y Web Push se cablean en fases posteriores; pueden quedar vacías por ahora.

### Base de datos

Aplica el schema y crea las cuentas iniciales:

```bash
npm run db:migrate   # crea las tablas en Neon
npm run db:seed      # inserta los 2 usuarios (idempotente, usa upsert)
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El proxy te redirige a `/login`. Ingresa con cualquiera de las credenciales seedeadas.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:migrate` | Crea / aplica migraciones (modo dev) |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:seed` | Crea o actualiza los usuarios desde `SEED_*` |

---

## Arquitectura

```
src/
├── app/
│   ├── (app)/                 ← rutas autenticadas (layout con TopAppBar + BottomNavBar)
│   │   ├── layout.tsx
│   │   └── page.tsx           ← dashboard
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── plants/water-all-due/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx             ← root: fonts + html lang="es"
│   └── globals.css            ← tokens del design system
├── components/
│   ├── auth/                  ← LoginForm
│   ├── dashboard/             ← greeting, quick-actions, needs-attention, up-next
│   ├── layout/                ← TopAppBar, BottomNavBar, nav-items
│   └── ui/                    ← shadcn (button, input)
├── lib/
│   ├── auth.config.ts         ← config edge-safe (no Prisma)
│   ├── auth.ts                ← NextAuth completo (Credentials + bcrypt)
│   ├── db.ts                  ← Prisma singleton (adapter pg)
│   ├── dashboard/queries.ts   ← lógica de negocio del dashboard
│   ├── ai/                    ← (vacío) clientes Gemini / Claude
│   └── validators/            ← (vacío) schemas Zod compartidos
├── proxy.ts                   ← protección de rutas (Next 16: era middleware.ts)
├── i18n/es.json               ← strings en español
├── generated/prisma/          ← cliente Prisma (gitignored)
└── types/next-auth.d.ts       ← extensión de tipos de Session/JWT

prisma/
├── schema.prisma              ← User, Species, Plant, WateringEvent, Diagnosis, Reminder, SensorReading
└── migrations/

scripts/
└── seed.ts                    ← provisión de usuarios desde env
```

### Decisiones de arquitectura clave

- **Auth split edge/node**. `auth.config.ts` es edge-safe (lo usa `proxy.ts`); `auth.ts` carga Prisma + bcrypt y solo se usa en route handlers / server components. Sin esta separación, el build falla porque Prisma 7 no corre en Edge Runtime.
- **Sesiones JWT, sin Prisma adapter**. Solo hay 2 usuarios y todo es Credentials, así que no se necesitan tablas `Account`/`Session`/`VerificationToken`.
- **Sin signup público**. Los usuarios se crean con el script de seed.
- **Ficha de especie reutilizable**. Una `Species` puede tener N `Plant`. Cada `Plant` puede sobrescribir (`customWateringDays`) sin duplicar la ficha.
- **Solo modo claro** por ahora. Tokens de tema definidos en `globals.css` (paleta verde bosque + salvia + terracota sobre off-white cálido).

---

## Estado del MVP

### ✅ Hecho

- Scaffolding Next.js 16 + Tailwind 4 + shadcn/ui
- Base de datos en Neon con schema completo y migración inicial
- Autenticación con email + contraseña (NextAuth v5 + bcrypt + JWT)
- Pantalla de login (con fondo del invernadero, glassmorphism)
- Dashboard con saludo dinámico, quick actions, "necesitan atención" y sidebar "próximamente" (todos cableados a DB con empty states)
- Endpoint `POST /api/plants/water-all-due` (registra riego en lote, con auth)
- Top bar (desktop) + bottom nav (mobile) según breakpoint
- Design system aplicado con paleta y tipografías propias

### 🔜 Próximas pantallas

- `/plants/new` — agregar planta con foto e identificación vía Gemini
- `/plants/[id]` — detalle de planta (historial + ficha + acciones)
- `/diagnose` — diagnóstico por foto vía Claude
- Generación automática de recordatorios de riego
- Configuración PWA (manifest, service worker, push)

---

## Convenciones

- **Idioma**: textos de UI en español; código, commits y comentarios en inglés.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `chore:`, …).
- **TypeScript estricto**, sin `any` salvo justificación.
- **Validación con Zod** en todo input externo.
- **Server components por defecto**; client components solo cuando sea necesario (`useState`, eventos, etc.).

---

## Licencia

Proyecto personal. Uso privado.
