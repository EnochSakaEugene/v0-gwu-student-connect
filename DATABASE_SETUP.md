# Database setup (Neon Postgres + Drizzle + NextAuth)

This project no longer uses `localStorage` for application data. Everything is
now persisted in a Postgres database (Neon by default), accessed through
Drizzle ORM, and authenticated with NextAuth (Auth.js) using a credentials
provider.

## 1. Provision a Neon database on v0 / Vercel

1. Open your project in v0 (or its Vercel dashboard).
2. Go to **Storage → Add → Neon (Postgres)** and follow the prompts.
3. Vercel automatically injects `DATABASE_URL` (and `POSTGRES_URL`) into the
   project's environment variables. Pull them locally with:

   ```bash
   vercel env pull .env.local
   ```

   Or copy the values from the Vercel dashboard into `.env.local` by hand. See
   `.env.example` for the full list.

## 2. Add NextAuth secrets

In your Vercel project (and in `.env.local` for development) set:

```
NEXTAUTH_URL=https://<your-v0-domain>
NEXTAUTH_SECRET=<openssl rand -base64 32>
```

## 3. Install dependencies

```bash
pnpm install
```

The new dependencies are:

- `drizzle-orm`, `drizzle-kit` — schema, migrations, query builder.
- `@neondatabase/serverless` — HTTP-based Postgres driver that works in v0/Vercel
  Edge & serverless functions.
- `next-auth`, `@auth/drizzle-adapter` — authentication.
- `bcryptjs` — password hashing.
- `zod` — request validation.
- `tsx`, `dotenv` — to run the seed script locally.

## 4. Push the schema to Neon

```bash
pnpm db:push
```

This creates every table defined in `lib/db/schema.ts`.

Optional: open Drizzle Studio to inspect the database:

```bash
pnpm db:studio
```

## 5. Seed demo content

```bash
pnpm db:seed
```

This creates three demo accounts (all with password `password123`):

| Email                              | Role     |
| ---------------------------------- | -------- |
| `alex.johnson@gwconnect.edu`       | student  |
| `sarah.johnson@gwu.edu`            | faculty  |
| `jordan.alum@gwconnect.edu`        | alumni   |

It also inserts the demo events, blogs, study groups, and study materials that
used to be hard-coded.

## 6. Run the app

```bash
pnpm dev
```

When deploying to v0/Vercel, the `db:push` and `db:seed` commands can be run
once from your local machine pointing at the Neon database — Vercel does not
need to run them at deploy time.

## File map

```
lib/
  db/
    index.ts          # Neon + Drizzle client
    schema.ts         # All tables, enums, relations
  auth.ts             # NextAuth options, helpers
  api-helpers.ts      # getSessionUser/requireSessionUser
  api-client.ts       # Tiny fetch wrapper used by client components
app/
  api/
    auth/
      [...nextauth]/route.ts
      register/route.ts
    events/...        # /api/events, /api/events/[id], rsvp, mine
    blogs/...
    study-groups/...
    study-materials/...
    profile/me, profile/[id]
    follows/[userId]
    appointments
    messages
    directory
contexts/events-context.tsx   # now reads from /api/events
scripts/seed.ts               # Demo data seeder
drizzle.config.ts             # drizzle-kit config
```

## Going further

- Swap the inline `image` upload (data URL → user.image) for Vercel Blob.
- Add an Auth.js OAuth provider (Google, GitHub) by installing the relevant
  package and adding it to `lib/auth.ts`.
- Add Drizzle migrations (`pnpm db:generate`) once the schema stabilises so
  schema changes ship with versioned SQL files instead of `db:push`.
