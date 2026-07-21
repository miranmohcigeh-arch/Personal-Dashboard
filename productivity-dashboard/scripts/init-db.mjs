// Usage: DATABASE_URL="postgres://..." node scripts/init-db.mjs
// Or add DATABASE_URL to a .env file and it will be loaded automatically.
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(url);
const schemaPath = path.join(process.cwd(), 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Split on semicolons at statement boundaries (simple schema, no semicolons inside strings)
const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

const run = async () => {
  for (const statement of statements) {
    console.log('Running:', statement.slice(0, 60).replace(/\s+/g, ' '), '...');
    await sql(statement);
  }
  console.log('✅ Database initialized.');
};

run().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
