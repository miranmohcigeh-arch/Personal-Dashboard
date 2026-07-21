import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env.local (dev) or your Vercel project env vars (prod).'
  );
}

// neon() gives a tagged-template SQL function over HTTP — ideal for
// serverless functions / edge runtimes on Vercel (no persistent connections).
export const sql = neon(process.env.DATABASE_URL);
