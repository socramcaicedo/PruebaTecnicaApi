import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { pool } from '../src/persistence/db';

beforeAll(async () => {
  const schema = readFileSync(resolve(process.cwd(), 'db/schema.sql'), 'utf8');
  await pool.query(schema);
});

beforeEach(async () => {
  await pool.query('TRUNCATE tasks, users CASCADE');
});

afterAll(async () => {
  await pool.end();
});
