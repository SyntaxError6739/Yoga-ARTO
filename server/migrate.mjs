import { readFile } from 'node:fs/promises';
import { getPool, closePool } from './db.mjs';

const pool = getPool();
const client = await pool.connect();

try {
  await client.query('BEGIN');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  const migration = '001_initial.sql';
  const applied = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [migration]);
  if (applied.rowCount === 0) {
    await client.query(await readFile(new URL(`./migrations/${migration}`, import.meta.url), 'utf8'));
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [migration]);
    console.log(`Applied ${migration}`);
  } else {
    console.log(`${migration} already applied`);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await closePool();
}
