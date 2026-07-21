# Personal Productivity Dashboard

Next.js 14 (App Router) dashboard for tasks, quick notes, and habit tracking,
backed by Neon Postgres. Server Actions handle all reads/writes — no separate
API layer needed.

## Stack
- Next.js 14 App Router, React Server Components + Server Actions
- Neon Postgres via `@neondatabase/serverless` (HTTP driver — works great in
  Vercel's serverless/edge functions, no connection pooling headaches)
- Tailwind CSS
- Deploys to Vercel

## 1. Create the Neon database
1. Go to https://neon.tech and create a free project (any region).
2. In the Neon console, open **Connection Details** and copy the connection
   string (the pooled one, e.g. `postgres://...@ep-xxxx-pooler.../neondb?sslmode=require`).
3. Load the schema — either:
   - Paste the contents of `schema.sql` into the Neon SQL Editor and run it, **or**
   - Locally: `DATABASE_URL="<your-connection-string>" npm run db:init`

## 2. Local development
```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your real DATABASE_URL
npm run db:init      # creates tables if you haven't already
npm run dev
```
Visit http://localhost:3000.

## 3. Deploy to Vercel
```bash
npm i -g vercel   # if you don't have it
vercel
```
Or via the dashboard:
1. Push this project to a GitHub repo.
2. In Vercel, **Add New Project** → import the repo.
3. Under **Environment Variables**, add `DATABASE_URL` with your Neon
   connection string (Production + Preview + Development).
4. Deploy. Vercel auto-detects Next.js — no build config needed.

**Tip:** Vercel has a built-in Neon integration (Storage tab → Connect
Database → Neon) that provisions a Neon project and injects `DATABASE_URL`
into your project automatically — you can use that instead of steps 1–2 above.

## Project structure
```
app/
  page.tsx        Dashboard (server component, fetches data)
  actions.ts       Server Actions: all DB reads/writes for tasks/notes/habits
  layout.tsx / globals.css
components/
  TaskBoard.tsx    Task list + add-task form (client)
  NotesWidget.tsx  Quick notes (client)
  HabitsWidget.tsx Habit tracker with streaks (client)
  StatsCards.tsx   Summary stats (server)
  Greeting.tsx     Time-aware greeting (client)
lib/
  db.ts            Neon connection (sql tagged template)
  types.ts         Shared TS types
schema.sql          Postgres schema (tasks, notes, habits, habit_logs)
scripts/init-db.mjs Runs schema.sql against DATABASE_URL
```

## Extending it
- Auth: this is single-user by design. To support multiple users, add a
  `user_id` column to each table and gate `actions.ts` behind an auth check
  (e.g. NextAuth, Clerk, or Vercel's own auth templates).
- More widgets: follow the same pattern — a query/mutation in `actions.ts`,
  a small client component, drop it into `app/page.tsx`.
