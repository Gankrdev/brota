# Brota 🌱

> **Cuida, observa, brota.**
> Asistente inteligente para el cuidado de plantas del hogar.

Brota es una PWA personal que ayuda a recordar riegos, llevar fichas por especie, registrar el historial de cuidados y diagnosticar la salud de las plantas mediante IA. Pensada para uso doméstico (2 usuarios), con dashboard web y experiencia móvil instalable en Android e iPhone.

> Para la visión completa del proyecto, decisiones técnicas y roadmap consulta [`CLAUDE.md`](./CLAUDE.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Lenguaje | TypeScript estricto |
| UI | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Auth | [NextAuth v5](https://authjs.dev) (CredentialsProvider + JWT) |
| Validación | [Zod](https://zod.dev) |
| ORM | [Prisma 7](https://www.prisma.io) |
| Base de datos | [Neon](https://neon.tech) (PostgreSQL serverless) |
| IA — identificación + ficha | Gemini 2.5 Flash |
| IA — diagnóstico | Claude Sonnet 4.6 |
| Almacenamiento de imágenes | [Vercel Blob](https://vercel.com/storage/blob) |
| Notificaciones | Web Push API (VAPID) |
| Analíticas | [Vercel Analytics](https://vercel.com/analytics) |
| Hosting | [Vercel](https://vercel.com) |

---

## Requisitos previos

- **Node.js 18+**
- Cuenta en [Neon](https://console.neon.tech) (PostgreSQL gratuito)
- API keys de [Anthropic](https://console.anthropic.com) y [Google AI Studio](https://aistudio.google.com)

---

## Setup local

```bash
git clone https://github.com/Gankrdev/brota.git
cd brota
npm install
```

### Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Neon |
| `AUTH_SECRET` | Genera con `npx auth secret` |
| `ANTHROPIC_API_KEY` | API key de Anthropic (Claude) |
| `GOOGLE_GENAI_API_KEY` | API key de Google AI Studio (Gemini) |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID para push |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID |
| `VAPID_SUBJECT` | Email de contacto (`mailto:...`) |
| `CRON_SECRET` | Secret para proteger el endpoint de cron |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | Usuario administrador |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` / `SEED_USER_NAME` | Segundo usuario |

### Base de datos

```bash
npm run db:migrate   # crea las tablas
npm run db:seed      # crea los 2 usuarios (idempotente)
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:migrate` | Aplica migraciones |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:seed` | Crea o actualiza los usuarios |

---

## Funcionalidades

### ✅ Implementado

- Autenticación con email + contraseña (NextAuth v5 + bcrypt + JWT)
- Dashboard con estado de plantas, próximos riegos y acciones rápidas
- CRUD de plantas con foto
- Identificación automática de especie al agregar planta (Gemini 2.5 Flash)
- Ficha de especie generada por IA (luz, agua, temperatura, humedad, cuidados especiales)
- Registro de riegos con historial
- Recordatorios de riego con notificaciones push (Web Push API)
- Diagnóstico de salud por foto con IA (Claude Sonnet 4.6)
- Historial de cuidados y diagnósticos por planta
- Vista calendario de cuidados
- PWA instalable en Android e iPhone (manifest, service worker, íconos, splash screens)
- Rate limiting en rutas de IA para proteger el saldo de API
- Cron job horario para enviar recordatorios (Vercel Cron)
- Analíticas con Vercel Analytics

### 🔜 Próximamente

- Ajuste estacional automático de frecuencia de riego
- Historial visual con fotos por planta
- Sensores de humedad ESP32 (Fase 2)

---

## Arquitectura

```
src/
├── app/
│   ├── (app)/                 ← rutas autenticadas
│   ├── api/                   ← route handlers (plants, diagnosis, reminders, push, cron)
│   ├── login/
│   └── layout.tsx             ← root: fonts, PWA meta tags, SW register, Analytics
├── components/
│   ├── dashboard/
│   ├── plant/
│   ├── diagnosis/
│   ├── calendar/
│   ├── history/
│   ├── garden/
│   ├── layout/
│   └── ui/                    ← shadcn
├── lib/
│   ├── ai/                    ← clientes Claude y Gemini + prompts
│   ├── auth.ts / auth.config.ts
│   ├── db.ts
│   ├── rate-limit.ts          ← rate limiter in-memory por usuario
│   ├── watering.ts
│   └── dashboard/queries.ts
├── hooks/
│   └── use-push-notifications.ts
└── types/

prisma/
├── schema.prisma
└── migrations/

public/
├── manifest.json
├── sw.js
└── icons/                     ← íconos PWA + splash screens iOS
```

---

## Convenciones

- **Idioma**: textos de UI en español; código, commits y comentarios en inglés.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `chore:`, …).
- **TypeScript estricto**, sin `any` salvo justificación.
- **Validación con Zod** en todo input externo.
- **Server components por defecto**; client components solo cuando sea necesario.

---

## Licencia

Proyecto personal. Uso privado.
