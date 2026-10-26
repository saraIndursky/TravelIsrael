# TravelIsrael

A web platform for planning, discovering and sharing trips in Israel. Hebrew, RTL, mobile-first interface.

**Live demo:** [travel-israel.vercel.app](https://travel-israel.vercel.app)

## Tech Stack

- Next.js 14 (App Router) · React 18 · TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase — Auth, Postgres with RLS, Storage
- Zustand for the wizard state · React Hook Form + Zod for forms
- Leaflet for maps

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.example` documents every variable. The minimum is `NEXT_PUBLIC_SUPABASE_URL` and one
public key. Changing a `NEXT_PUBLIC_` variable requires restarting the dev server, because the
value is inlined at build time.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run dev:clean` | Clears the `.next` cache, then runs dev — for 404s on static files |
| `npm run verify:dev` | Checks that the wizard and CSS are served correctly |
| `npm run build` | Production build. Blocked automatically if a dev server is running on port 3000 |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E (Playwright) — requires Supabase; login/trip/approval tests require `E2E_USER_*` |

## Testing

- **Unit** — `npm run test` (Vitest): trip calculations, match score, Zod validations
- **E2E** — `npm run test:e2e` (Playwright): wizard, login and profile, trip creation, place editing and approval
- **CI** — `.github/workflows/ci.yml` runs typecheck, lint, unit tests and build on every push; E2E runs manually only (Run workflow) and requires secrets

### Lint & format

The project uses **ESLint** (`eslint-config-next`) rather than Biome, to avoid duplicating Next.js tooling.
A pre-commit hook runs `lint-staged` on `.ts/.tsx` files (run `npm install` once to enable the hook).

### Branch protection (GitHub)

Recommended for `main`: require a PR, require the `verify` status check, and optionally `e2e` after adding the secrets:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`.

## Database

The full schema is documented in [`supabase/README.md`](supabase/README.md), including RLS,
the RPCs and the demo data.

### Two schemas

`public` is the real environment. `demo` is a full copy in the same project with rich test data,
for testing flows without touching production. To switch:

```
NEXT_PUBLIC_SUPABASE_SCHEMA=demo
```

Both share `auth.users` — the same accounts and passwords.

### Permissions

Enforced by RLS in the database, not in client code:

- **Guest** — reads approved content only
- **User** — CRUD on content they created, and on their own ratings, reviews and favorites
- **Admin** — full access, approves and rejects content, handles reports

Content lifecycle: `draft → pending → approved | rejected → (edit) → pending`.
An owner can edit only while the item is `pending` or `rejected`, and every edit returns it to
`pending`. Only an admin can move it to `approved`.

### First admin

The first user who signs up automatically gets the `admin` role. After that, only the address set
in `NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL` is promoted. Promotion only — a role is never lowered
automatically.

## Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/login`, `/register` | Login and sign-up |
| `/trips`, `/trips/[id]` | Trip discovery and trip page |
| `/trips/create`, `/trips/[id]/edit` | Create and edit a trip |
| `/places`, `/places/[id]` | Places |
| `/places/create`, `/places/[id]/edit` | Create and edit a place |
| `/trails`, `/trails/[id]` | Trails |
| `/trails/create`, `/trails/[id]/edit` | Create and edit a trail |
| `/wizard`, `/wizard/results` | Trip matching wizard |
| `/profile`, `/profile/trips`, `/profile/content` | Personal area |
| `/admin` | Admin panel |
| `/admin/trips`, `/admin/places`, `/admin/trails` | Content approval and rejection |
| `/admin/users`, `/admin/regions`, `/admin/reports` | Users, regions and reports management |

## Project structure

```
app/                 Pages (App Router)
components/
  ui/                shadcn primitives
  layout/            Header, Footer, MobileNav
  features/          trips, places, trails, wizard, admin, profile
lib/
  data/              Data access layer — every query and mutation goes through here
  supabase/          Clients, mappers, schema configuration
  utils/             Helpers
  validations/       Zod schemas
types/               TypeScript types
hooks/               Custom hooks
supabase/            Database schema documentation and demo data
scripts/             Dev environment maintenance scripts
```

## AI assistant

Content creation is supported by an assistant that fills in form fields. The default is
`ASSISTANT_MODE=demo` — a local rule-based assistant with no external calls and no cost. With
`ASSISTANT_MODE=openai` and an `OPENAI_API_KEY` it switches to OpenAI, and falls back to demo if
the key is missing.

## Developing on Windows

A blank page or unstyled HTML is almost always caused by a broken `.next` cache. Three rules prevent it:

1. Do not run `npm run build` while the dev server is running
2. Do not delete `.next` before stopping the dev server
3. After styling changes, run `npm run verify:dev`, and if it fails, `npm run dev:clean`
