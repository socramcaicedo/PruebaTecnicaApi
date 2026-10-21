import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Missing environment variable: DATABASE_URL');
  }

  const pool = new Pool({ connectionString });

  try {
    const schema = readFileSync(resolve(process.cwd(), 'db/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema applied successfully.');
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
