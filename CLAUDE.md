# CLAUDE.md — Brota 🌱

Guía maestra del proyecto **Brota** para agentes de IA (Claude Code y similares) que trabajen en este repositorio.

---

## 1. Contexto del proyecto

### 1.1 Nombre del proyecto

**Brota** — app de cuidado inteligente de plantas.

El nombre evoca crecimiento, frescura y energía vital. Corto, memorable y con identidad propia. Tagline propuesto: *"Cuida, observa, brota"* (ajustable).

### 1.2 Propósito

Aplicación personal para gestionar el cuidado de las plantas del hogar. Nace como regalo para mi esposa, quien tiene entre 20 y 30 plantas distribuidas por toda la casa y ha enfrentado problemas de plantas que se pudren o se secan.

### 1.3 Problema que resuelve

- Olvidos de riego o riego excesivo "por si acaso".
- Desconocimiento de requerimientos específicos por especie (luz, agua, temperatura, humedad).
- Falta de diagnóstico oportuno cuando una planta muestra síntomas de enfermedad o estrés.
- Dificultad para llevar historial de cuidados de múltiples plantas.

### 1.4 Usuarios

- **Usuario principal**: mi esposa (uso diario, interfaz móvil simple).
- **Usuario administrador**: yo (dashboard web para configuración, mantenimiento y análisis).

### 1.5 Alcance (enfoque gradual)

**Fase 1 — MVP software puro (prioridad actual):**
- PWA instalable en celular.
- Dashboard web para administración.
- CRUD de plantas con fichas generadas por IA.
- Registro manual de riegos.
- Recordatorios inteligentes por planta.
- Diagnóstico por foto con IA.
- Catálogo de especies reutilizable.

**Fase 2 — Hardware (futuro, opcional):**
- Sensores inalámbricos (ESP32 + sensor de humedad capacitivo + batería) en plantas seleccionadas.
- Integración con broker MQTT.
- No se sensorizan las 30 plantas; solo las más problemáticas o queridas.

**Fase 3 — Expansión (si hay adopción real):**
- Más nodos sensores.
- Posible migración a LoRa si se escala.
- Integración con domótica existente.

---

## 2. Stack tecnológico

### 2.1 Frontend (PWA + Dashboard)

- **Framework**: Next.js (App Router).
- **Estilos**: Tailwind CSS.
- **Componentes UI**: shadcn/ui.
- **PWA**: `next-pwa` o Workbox para service worker, manifest.json, íconos adaptativos.
- **Gráficos**: Recharts.
- **Gestión de estado**: React Query (TanStack Query) para datos del servidor, Zustand si se necesita estado global en cliente.
- **Formularios**: React Hook Form + Zod.
- **Captura de imágenes**: `navigator.mediaDevices.getUserMedia` + input file fallback.

### 2.2 Backend

- **Runtime**: Node.js.
- **API**: Next.js API Routes o Route Handlers (App Router).
- **Validación**: Zod compartido entre frontend y backend.
- **Autenticación**: NextAuth (Auth.js) con provider de credenciales simples o magic link por email. Solo 2 usuarios (yo y mi esposa), no requiere registro público.
- **Almacenamiento de imágenes**: Cloudinary o Vercel Blob (evaluar costo/simplicidad).

### 2.3 Base de datos

- **Motor**: PostgreSQL.
- **ORM**: Prisma.
- **Migraciones**: gestionadas con Prisma Migrate.
- **Hosting DB**: Railway, Neon o Supabase (preferir el más económico con buen tier gratis).

### 2.4 IA (diagnóstico y generación de fichas)

- **Proveedores a evaluar**: Claude (Anthropic) y Gemini (Google).
- **Modelos candidatos**:
  - Claude Sonnet 4.6 o Claude Haiku 4.5 (razonamiento y diagnóstico).
  - Gemini 2.5 Pro o Gemini 2.5 Flash (identificación visual y alto volumen).
- **Estrategia**: validar con experimento comparativo antes de decidir. Posiblemente usar una para identificación/ficha y otra para diagnóstico.
- **Output**: siempre JSON estructurado (tool use en Claude, structured output en Gemini).

### 2.5 Notificaciones

- **Web Push API** con claves VAPID.
- Soporta Android (nativo en PWAs) e iOS 16.4+.
- Fallback por email para avisos importantes si la push falla.

### 2.6 Hosting

- **Frontend + API**: Vercel (plan gratuito para empezar).
- **Base de datos**: Railway, Neon o Supabase.
- **Almacenamiento de imágenes**: Cloudinary (tier gratuito generoso) o Vercel Blob.
- **Cron jobs**: Vercel Cron o worker en Railway.

### 2.7 Futuro (Fase 2 - Hardware)

- **Microcontrolador**: ESP32-C3 Super Mini o ESP32-S3 Mini.
- **Sensor de humedad**: capacitivo v1.2 (nunca resistivo por oxidación).
- **Sensores adicionales opcionales**: DHT22/SHT30 (temperatura/humedad ambiente), BH1750 (luz).
- **Batería**: LiPo 3.7V 1000-2000 mAh + módulo TP4056.
- **Comunicación**: MQTT (broker Mosquitto) vía WiFi.
- **Servidor local opcional**: Raspberry Pi 4 o Zero 2 W con broker + backend para no depender de nube.

---

## 3. Idioma y convenciones

### 3.1 Idioma de la interfaz

- **Todo el contenido visible al usuario en español** (usuario principal es hispanohablante).
- Mensajes de la IA, recordatorios, notificaciones: en español.
- Incluir localización para fechas, números y pluralización.

### 3.2 Idioma del código

- **Código, variables, funciones, clases, archivos**: inglés.
- **Comentarios de código**: inglés.
- **Textos de UI y mensajes al usuario**: español (idealmente vía archivos de i18n desde el inicio).
- **Commits**: inglés, convención Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- **Documentación (READMEs, CLAUDE.md)**: español para que sea accesible al dueño del proyecto.

### 3.3 Estilo de código

- **Linter**: ESLint con configuración de Next.js.
- **Formateador**: Prettier.
- **TypeScript**: estricto (`strict: true` en `tsconfig.json`).
- **Nombres**: camelCase para variables/funciones, PascalCase para componentes/tipos, kebab-case para archivos.
- **Componentes React**: functional components con hooks, nunca class components.

---

## 4. Modelo de datos (propuesta inicial)

### 4.1 Entidades principales

**User**
- `id`, `email`, `name`, `role` (admin/user), `createdAt`.

**Species** (ficha genérica de especie, reutilizable entre plantas)
- `id`, `commonName`, `scientificName`, `family`, `description`.
- `lightRequirement` (enum: low, medium_indirect, bright_indirect, direct).
- `wateringFrequencyDays` (int), `wateringFrequencyMin`, `wateringFrequencyMax`.
- `idealTempMinC`, `idealTempMaxC`, `criticalTempMinC`, `criticalTempMaxC`.
- `humidityIdealMin`, `humidityIdealMax`.
- `substrateType`, `phIdeal`.
- `fertilizationFrequency`, `fertilizationType`.
- `specialCare` (JSON array de strings).
- `commonProblems` (JSON array de `{problem, cause, solution}`).
- `difficulty` (enum: easy, medium, hard).
- `growthRate` (enum: fast, medium, slow).
- `activeSeasons` (JSON array).
- `generatedByAi` (bool), `aiModel`, `aiGeneratedAt`.

**Plant** (instancia individual)
- `id`, `nickname` (ej: "la del living"), `speciesId` → Species.
- `photoUrl`, `location` (string libre: "living", "balcón norte").
- `customWateringDays` (nullable, sobrescribe la de species).
- `acquiredAt`, `notes`.
- `createdAt`, `updatedAt`.

**WateringEvent**
- `id`, `plantId`, `wateredAt`, `amount` (opcional, enum: light/normal/heavy), `notes`.
- `registeredBy` (userId).

**Diagnosis**
- `id`, `plantId`, `photoUrl`, `reportedSymptoms` (string).
- `aiModel`, `aiResponse` (JSON completo).
- `healthStatus` (enum: healthy, attention, critical).
- `detectedIssues` (JSON), `probableCauses` (JSON), `recommendedActions` (JSON).
- `reviewNextDate`, `createdAt`.

**Reminder**
- `id`, `plantId`, `type` (enum: watering, fertilizing, check).
- `scheduledFor`, `sentAt`, `acknowledgedAt`.
- `status` (enum: pending, sent, acknowledged, dismissed).

**SensorReading** (Fase 2, dejar preparado)
- `id`, `plantId`, `sensorId`, `readAt`.
- `soilMoisture`, `ambientTemp`, `ambientHumidity`, `lightLevel`, `batteryVoltage`.

### 4.2 Principio clave

**La ficha de especie es plantilla; la planta individual puede sobrescribir.** Esto evita duplicar información y permite ajustes finos por condiciones particulares (ej: dos potus en ambientes distintos con riego diferente).

---

## 5. Prompts de IA

### 5.1 Prompt: Generación de ficha al agregar planta

**Input:**
- Foto de la planta.
- Nombre común opcional (si el usuario lo conoce).

**Output esperado:** JSON con estructura definida en `Species`, incluyendo:
- Identificación con `confianza_identificacion` (alta/media/baja).
- Requerimientos de luz, agua, temperatura, humedad.
- Cuidados especiales y problemas comunes.

**Reglas:**
- Si confianza es baja, pedir al usuario confirmar antes de guardar.
- Valores de temperatura en Celsius siempre.
- Frecuencia de riego como rango (min-max) y valor base.
- Nunca inventar nombres científicos: si no está seguro, dejar `null` y marcar confianza baja.

### 5.2 Prompt: Diagnóstico de problema

**Input:**
- Foto actual de la planta.
- Ficha de la especie (contexto).
- Síntomas reportados por el usuario (texto libre).
- Historial reciente: último riego, frecuencia normal, ubicación.
- Época del año / estación.

**Output esperado:** JSON con:
- `healthStatus`: healthy / attention / critical.
- `detectedIssues`: lista de síntomas visibles.
- `probableCauses`: ordenadas por probabilidad, con justificación.
- `recommendedActions`: accionables, priorizadas, con urgencia.
- `reviewNextDate`: cuándo volver a evaluar.
- `confidence`: nivel de confianza del diagnóstico.

**Reglas:**
- No alarmista: si la planta se ve sana, decirlo claramente.
- Acciones accionables (no "consulta a un experto" como respuesta principal).
- Considerar contexto estacional.
- Si no hay suficiente información visual, pedir otra foto desde otro ángulo.

### 5.3 Validación experimental (pendiente)

Antes de elegir IA definitiva, realizar experimento comparativo:
- 8-15 fotos reales (sanas, amarillas, pudrición, seca, plagas, ambiguas).
- Contexto mínimo por foto.
- Ejecutar ambos prompts en Claude y Gemini.
- Comparar según rúbrica: precisión en identificación, utilidad de consejos, falsos positivos, claridad.

---

## 6. Funcionalidades por prioridad

### 6.1 Must-have (MVP)

1. Autenticación básica (yo + mi esposa).
2. CRUD de plantas con fotos.
3. Generación automática de ficha al agregar planta (IA).
4. Catálogo de especies (reutilización de fichas).
5. Registro manual de riego (un tap desde PWA).
6. Recordatorios de riego (push notifications + fallback email).
7. Diagnóstico por foto con IA.
8. Vista dashboard con lista de plantas y estado.
9. Instalación como PWA en Android.

### 6.2 Should-have

10. Historial visual de cada planta (fotos + eventos).
11. Ajuste estacional automático de frecuencia de riego.
12. Edición manual de ficha generada por IA.
13. Vista calendario de cuidados.
14. Gráficos históricos de riegos y diagnósticos.

### 6.3 Nice-to-have

15. Modo offline con sincronización.
16. Exportación de datos (CSV/JSON).
17. Compartir ficha de planta por link.
18. Multi-idioma (además de español).

### 6.4 Futuro (Fase 2)

19. Integración con sensores ESP32.
20. Alertas por humedad de tierra baja.
21. Gráficos de humedad histórica por planta.
22. Detección automática de riego según sensor.

---

## 7. Estructura de carpetas propuesta

```
/
├── CLAUDE.md                  ← este archivo
├── README.md
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── (auth)/            ← rutas de autenticación
│   │   ├── (dashboard)/       ← dashboard web (escritorio)
│   │   ├── (pwa)/             ← vistas móviles PWA
│   │   ├── api/               ← API routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                ← shadcn/ui
│   │   ├── plants/
│   │   ├── diagnosis/
│   │   └── shared/
│   ├── lib/
│   │   ├── ai/                ← clientes Claude/Gemini
│   │   │   ├── claude.ts
│   │   │   ├── gemini.ts
│   │   │   └── prompts/
│   │   ├── db.ts              ← cliente Prisma
│   │   ├── auth.ts
│   │   └── validators/        ← schemas Zod
│   ├── hooks/
│   ├── types/
│   └── i18n/                  ← traducciones (es.json)
├── public/
│   ├── icons/                 ← íconos PWA
│   └── manifest.json
└── scripts/
    ├── seed.ts
    └── ai-comparison/         ← experimento comparativo IA
```

---

## 8. Decisiones técnicas clave (ya tomadas)

| Decisión | Elección | Razón |
|---|---|---|
| Tipo de app | PWA + Dashboard web | No depender de Play Store, instalable, funciona offline, dashboard para admin |
| Framework | Next.js | Unifica PWA y dashboard en un proyecto, API routes integradas |
| Base de datos | PostgreSQL + Prisma | Relacional, maduro, ORM con buen DX |
| Sensores (Fase 1) | Ninguno | Prioridad es software; validar uso real antes de invertir en hardware |
| IA | Por decidir (experimento pendiente) | Comparar Claude vs Gemini con fotos reales antes de comprometerse |
| Hosting | Vercel + Railway/Neon | Tier gratuito suficiente, buen DX |
| Autenticación | NextAuth simple | Solo 2 usuarios, no necesita complejidad |

---

## 9. Consideraciones importantes para agentes de IA

### 9.1 Al escribir código

- **TypeScript estricto siempre**. Nunca `any` sin justificación comentada.
- **Validación con Zod en todos los endpoints**. Nunca confiar en input del cliente.
- **Manejo de errores explícito**. Los endpoints de IA pueden fallar; siempre tener fallback.
- **Server components por defecto** en Next.js App Router; client components solo cuando sea necesario.
- **Accesibilidad**: labels en formularios, contraste, navegación por teclado.

### 9.2 Al trabajar con la IA del proyecto

- **Nunca hardcodear API keys**. Usar variables de entorno (`.env.local`).
- **Siempre pedir output en JSON estructurado**. Nunca parsear texto libre.
- **Validar la respuesta de la IA con Zod** antes de guardarla en DB.
- **Logear costos y latencia** de cada llamada para monitoreo.
- **Rate limiting** en endpoints que llaman a IA.

### 9.3 Al trabajar con imágenes

- **Comprimir antes de subir** (en cliente, con `canvas` o librería tipo `browser-image-compression`).
- **Límite de tamaño**: máximo 2 MB por imagen subida a la IA.
- **Formatos aceptados**: JPEG, PNG, WebP.
- **Metadata**: eliminar EXIF por privacidad antes de subir.

### 9.4 Al trabajar con la DB

- **Migraciones siempre con Prisma Migrate**, nunca editar DB directo.
- **Índices** en foreign keys y campos de búsqueda frecuente.
- **Soft delete** para plantas (no borrado físico): usar campo `deletedAt`.
- **Transacciones** cuando se modifiquen múltiples tablas.

### 9.5 Al trabajar con notificaciones

- **Pedir permiso explícitamente** al usuario, no al cargar la app.
- **Permitir configurar** qué notificaciones recibir (riegos, diagnósticos, etc.).
- **Respetar horarios**: no enviar push en horario de sueño (configurable).

### 9.6 Privacidad y seguridad

- Las fotos de la casa son privadas. No usar servicios de IA que entrenen con los datos enviados.
- Revisar términos de Claude API y Gemini API: ambos tienen políticas de no-entrenamiento para API paga.
- Variables sensibles solo en `.env.local`, nunca commitear.
- HTTPS obligatorio en todos los ambientes.

---

## 10. Estado actual del proyecto

**Fase actual:** Diseño y planificación.

**Próximos pasos inmediatos:**
1. Juntar 8-15 fotos reales de plantas de mi esposa (sanas, enfermas, ambiguas).
2. Obtener API keys de Anthropic y Google AI Studio.
3. Crear script de comparación IA (`scripts/ai-comparison/`).
4. Ejecutar experimento comparativo con prompts base.
5. Decidir IA (o combinación) según resultados.
6. Iniciar Setup del proyecto Next.js.

**Decisiones tomadas (2026-04-24):**
- ✅ IA para identificación de especies + generación de ficha: **Gemini 2.5 Flash** (rápido, económico, fuerte en identificación visual).
- ✅ IA para diagnóstico de salud por foto: **Claude Sonnet 4.6** (mejor razonamiento para correlacionar síntomas con contexto histórico y ficha de especie).
- ✅ Base de datos: **Neon** (Postgres serverless).
- ✅ Almacenamiento de imágenes: **Vercel Blob** (suficiente para el volumen esperado, simplicidad operativa).

**Pendientes de decisión:**
- [ ] Fecha objetivo de entrega del MVP.

---

## 11. Glosario

- **PWA**: Progressive Web App. App web instalable que se comporta como nativa.
- **Ficha de especie**: plantilla genérica con requerimientos de una especie botánica.
- **Planta (instancia)**: ejemplar individual que pertenece a una especie.
- **Diagnóstico**: evaluación de salud de una planta basada en foto y contexto.
- **Nodo sensor**: dispositivo ESP32 con sensores que reporta datos de una o más plantas (Fase 2).

---

## 12. Referencias útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Anthropic API Docs](https://docs.claude.com)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [shadcn/ui](https://ui.shadcn.com)

---

*Proyecto: **Brota***
*Última actualización: 2026-04-24*
