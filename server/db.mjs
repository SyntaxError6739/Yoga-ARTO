import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    maxUses: 7_500
  });

  pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error.message);
  });

  return pool;
}

export async function closePool() {
  if (pool) await pool.end();
}
