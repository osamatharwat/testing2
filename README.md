# Aliens Space — Student Team Operating System

React/Vite application for the Aliens student-team operating system. This repository ships with a Supabase production migration, Supabase Auth integration, cloud hydration/persistence, and a GitHub Pages workflow.

## 1) Local run

```bash
npm install
npm run dev
```

## 2) Supabase setup — required for Production

Open the Supabase project SQL Editor and run **`supabase/migrations_aliens_complete.sql`** once. It adds the missing fields/tables required by the current UI model, enables/cleans RLS for the critical domains, creates `aliens_os_state`, and installs the corrected recruitment RPCs.

Then create the initial admin account in Supabase Authentication and create its matching row in `public.profiles` with `role = 'og'`. Do not put a service-role key in the frontend.

Required frontend variables:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_DEMO_MODE=false
```

The anon key is safe for a browser application when database RLS is correctly configured. The Supabase **service-role key must never be committed or exposed to the browser**.

## 3) Cloud migration behavior

On startup, the app hydrates the public CMS state and authenticated profile/application data from Supabase. LocalStorage is only the synchronous UI cache. Admin/leadership writes are mirrored to Supabase automatically. Public/member mutations such as event registration, gallery comments/likes, and memory comments/likes use direct Supabase tables/RPCs so users cannot overwrite whole collections.

The Admin Supabase panel can still be used to test the connection and explicitly push/pull the current cached CMS state.

## 4) GitHub Pages

The repository contains `.github/workflows/deploy.yml`. Push to `main` or run the workflow manually. In GitHub: **Settings → Pages → Source: GitHub Actions**.

Add these repository variables under **Settings → Secrets and variables → Actions → Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The workflow builds with `VITE_DEMO_MODE=false`.

## 5) Validation

```bash
npm run typecheck
npm run build
npm run check
```

## Security rules

- Never commit `.env`, service-role keys, passwords, or database credentials.
- Keep Supabase RLS enabled.
- Do not re-enable the old `aliens_*` JSON mirror tables.
- Do not add client-side role switching to production.


## Local development

Do not open `index.html` by double-clicking it. This project is a Vite/React application and must run through the Vite dev server. On Windows, double-click `start-local.bat`.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. GitHub Pages is deployed through the included GitHub Actions workflow, which builds the project before publishing the generated `dist` directory.
