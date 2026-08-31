# Eat&Fit — Setup Guide

PWA de seguimiento de hábitos (comida + deporte) para 2 usuarios. Stack: Next.js 16 · Supabase · Tailwind v4 · Web Push.

---

## 🟡 Estado actual (2026-08-31) — Continuar desde aquí

### ✅ Hecho (build limpio, primer commit en `master`)

| Área | Estado |
|---|---|
| Scaffold Next.js 16 + Tailwind v4 | ✅ |
| Auth Google OAuth (alta) + callback | ✅ |
| Setup PIN (bcrypt, validación unicidad) | ✅ |
| Acceso diario por PIN → JWT cookie 30d | ✅ |
| Cierre automático de registro al 2º PIN (trigger SQL) | ✅ |
| Proxy (middleware) — guard de sesión | ✅ |
| Calendario mensual — claymorphism, colores, toggle pareja | ✅ |
| Modal edición (hoy: comida+deporte; futuro: objetivo; pasado: lectura) | ✅ |
| Dashboard estadísticas (kms, racha, %, deportes) | ✅ |
| PWA — manifest.json + service worker | ✅ |
| Push notifications — subscribe + Edge Function cron | ✅ |
| Schema SQL + RLS + trigger cierre registro | ✅ |
| BottomNav con 3 tabs (Inicio / Stats / Ajustes) | ✅ |
| README con pasos manuales de configuración | ✅ |

### ❌ Pendiente antes de poder probar en local

1. **Crear `.env.local`** — copiar `.env.example` y rellenar:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   SESSION_SECRET=          ← openssl rand -hex 32
   VAPID_PUBLIC_KEY=        ← npx web-push generate-vapid-keys
   VAPID_PRIVATE_KEY=
   VAPID_SUBJECT=mailto:adrian.gomez.dejuan@gmail.com
   ```

2. **Crear proyecto Supabase** (gratis en supabase.com) y copiar keys.

3. **Ejecutar migración SQL** — pegar `supabase/migrations/0001_init.sql` en el SQL Editor de Supabase.

4. **Activar Google OAuth en Supabase** — Auth → Providers → Google → pegar Client ID/Secret de Google Cloud Console. Callback URL: `https://<proyecto>.supabase.co/auth/v1/callback`.

5. **Añadir iconos PWA** — colocar los PNGs definitivos en:
   - `public/icon-192.png` (192×192)
   - `public/icon-512.png` (512×512)
   - (Actualmente hay un SVG placeholder en `public/icon.svg`)

6. **`npm run dev`** → probar flujo completo: `/signup` → Google → `/setup-pin` → PIN → `/home`.

### ⚠️ Gotchas importantes

- **`&` en el path del directorio**: los scripts de npm usan `node ./node_modules/next/dist/bin/next ...` en lugar de `next` directamente, porque Windows CMD interpreta `&` como separador de comandos. No cambiar.
- **Next.js 16**: el fichero de middleware se llama `proxy.ts` (no `middleware.ts`) y exporta `proxy` en lugar de `middleware`.
- **Supabase**: todas las APIs del servidor usan `service_role` (bypass RLS). Las políticas RLS existen como defensa en profundidad pero no son el mecanismo activo.
- **Sesión dual**: el usuario se autentica con Google OAuth (Supabase session) solo en el alta. El acceso diario usa exclusivamente la cookie `eatfit_session` (JWT firmado con `SESSION_SECRET`), independiente de Supabase.
- **Tailwind v4**: los tokens se definen en `app/globals.css` dentro de `@theme {}`, no en `tailwind.config.ts`.
- **`dynamic = 'force-dynamic'`**: todas las páginas server que llaman a Supabase tienen este export para evitar prerendering en build time.

### 🔜 Próximas funcionalidades (post-MVP)

- [ ] Página `/settings`: cambiar PIN propio
- [ ] Confirmación visual al guardar en DayModal (toast)
- [ ] Offline support en el Service Worker (cache de assets)
- [ ] Deploy en Vercel (ver sección de setup abajo)
- [ ] Edge Function `daily-reminder` — deploy + cron en Supabase

---

## Pasos de configuración (una sola vez)

### 1. Crear proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) → New project.
2. Copia las keys desde **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurar Google OAuth en Supabase

1. En Supabase: **Authentication → Providers → Google → Enable**.
2. Ve a [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (tipo: Web application).
3. Authorized redirect URIs:
   ```
   https://<tu-proyecto>.supabase.co/auth/v1/callback
   ```
4. Copia **Client ID** y **Client Secret** y pégalos en Supabase → Google provider.
5. En Supabase también añade la URL de tu app en **Authentication → URL Configuration → Site URL**.

### 3. Ejecutar la migración SQL

Opción A (CLI):
```bash
npx supabase db push
```

Opción B (SQL Editor en Supabase dashboard):
- Copia el contenido de `supabase/migrations/0001_init.sql` y ejecútalo.

### 4. Generar VAPID keys (notificaciones push)

```bash
npx web-push generate-vapid-keys
```

Guarda `Public Key` → `VAPID_PUBLIC_KEY` y `Private Key` → `VAPID_PRIVATE_KEY`.

### 5. Crear `.env.local`

```bash
cp .env.example .env.local
# Rellena todos los valores
```

Variables necesarias:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SESSION_SECRET=<string-aleatorio-largo>   # openssl rand -hex 32
VAPID_PUBLIC_KEY=BEl62...
VAPID_PRIVATE_KEY=sdfn...
VAPID_SUBJECT=mailto:tu@email.com
```

### 6. Desplegar la Edge Function (notificaciones push)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <tu-project-ref>
supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=...
supabase functions deploy daily-reminder
```

Luego en Supabase dashboard → **Edge Functions → daily-reminder → Schedule**:
- Cron: `0 20 * * *` (UTC 20:00 = 21:00 hora Madrid en invierno)

### 7. Deploy en Vercel

1. `git push` a GitHub.
2. Conecta el repositorio en [vercel.com](https://vercel.com).
3. Añade todas las variables de entorno.
4. Deploy.

---

## Desarrollo local

```bash
npm run dev     # http://localhost:3000
npm run build   # Verifica que compila sin errores
```

---

## Flujo de alta (primera vez)

1. Primer usuario → `/signup` → Google → crea PIN en `/setup-pin`.
2. Segundo usuario hace lo mismo.
3. Tras el 2º PIN, `registro_cerrado = true` automáticamente.

## Acceso diario

- Pantalla `/pin` → 4 dígitos → el sistema identifica el usuario automáticamente.
- Sesión válida 30 días (cookie httpOnly firmada).
- Logout en Ajustes → Cerrar sesión.

---

## Iconos PWA

Sustituye `public/icon-192.png` y `public/icon-512.png` con los iconos reales.
Herramienta: [realfavicongenerator.net](https://realfavicongenerator.net).
