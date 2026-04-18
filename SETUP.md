# Grab It MVP — Guía de Instalación Local

Esta guía cubre los pasos para levantar el proyecto en tu máquina después de
clonar o copiar esta carpeta.

---

## Prerrequisitos

- Node.js 18+ ([descargar](https://nodejs.org))
- Cuenta en [Supabase](https://supabase.com) (plan gratuito funciona)
- Cuenta en [Vercel](https://vercel.com) (para deploy, opcional en desarrollo)

---

## Paso 1 — Variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto con tus credenciales de Supabase:

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local
```

Luego edita `.env.local` y reemplaza los valores:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |

---

## Paso 2 — Base de datos

1. Ve a **Supabase Dashboard → SQL Editor → New Query**
2. Copia y pega todo el contenido de `grabit-schema.sql`
3. Haz clic en **Run** (o Ctrl+Enter)
4. Verifica que las 11 tablas aparezcan en **Table Editor**

---

## Paso 3 — Instalar dependencias

```bash
npm install
```

---

## Paso 4 — Agregar componentes shadcn/ui

Ejecuta este comando **una sola vez** para instalar todos los componentes UI necesarios:

```bash
npx shadcn@latest add button input label select badge dialog table form toast dropdown-menu tabs card sheet avatar skeleton separator textarea popover command scroll-area alert
```

Si te pregunta sobre el estilo, elige `New York`. Si te pregunta sobre colores base, elige `Slate`.

---

## Paso 5 — Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Paso 6 — Crear usuario admin en Supabase

1. Ve a **Supabase → Authentication → Users → Invite user**
2. Ingresa tu email y envía la invitación
3. Copia el **UUID** del usuario creado
4. Ve a **SQL Editor** y ejecuta (reemplazando los valores):

```sql
-- Reemplaza con tu UUID real y tu email
INSERT INTO companies (id, name, delivery_type, contact_email)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Grab It SAS',
  'express',
  'hola@grabit.app'
);

INSERT INTO users (id, company_id, email, full_name, role)
VALUES (
  '<TU-UUID-DE-AUTH>',
  'aaaaaaaa-0000-0000-0000-000000000001',
  '<TU-EMAIL>',
  'Admin Grab It',
  'admin'
);
```

---

## Estructura del proyecto

```
grabit-app/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (admin)/admin/         # Panel admin (Sesiones 2–4)
│   └── (client)/client/       # Vista cliente (Sesión 3)
├── components/ui/             # Componentes shadcn/ui (se generan con paso 4)
├── lib/
│   ├── types.ts               # Tipos TypeScript de todas las entidades
│   ├── constants.ts           # Labels, colores y configuraciones
│   └── utils.ts               # Helpers: formatCurrency, formatDate, etc.
├── supabase/
│   ├── client.ts              # Cliente Supabase para navegador
│   └── server.ts              # Cliente Supabase para servidor (SSR)
├── middleware.ts              # Protección de rutas por rol
├── grabit-schema.sql          # Schema completo de la base de datos
└── SETUP.md                   # Este archivo
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en localhost:3000 |
| `npm run build` | Build de producción |
| `npm run start` | Inicia el servidor en modo producción |
| `npm run lint` | Linter de TypeScript/ESLint |

---

## Deploy en Vercel

1. Sube el proyecto a GitHub
2. En [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. Agrega las mismas variables de entorno de `.env.local` en **Environment Variables**
4. Haz clic en **Deploy**

---

## Próximos pasos (Plan Maestro)

Sigue el **Plan_Maestro_MVP_GrabIt.docx** para continuar con:

- **Sesión 2**: Módulo de Empresas y Usuarios (CRUD completo)
- **Sesión 2**: Módulo de Cotizaciones (crear, editar, cambiar estado)
- **Sesión 3**: Interfaz de chat cliente (solicitar cotización)
- **Sesión 3**: Módulo de Pedidos y tracking
- **Sesión 4**: Facturas, notificaciones por email (Resend), deploy a Vercel

---

¿Problemas? Escríbenos: hola@grabit.app
