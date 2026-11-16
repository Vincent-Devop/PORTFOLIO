import pg from 'pg'

const { Pool } = pg
let pool

export function getPool() {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    })
  }
  return pool
}

export async function closePool() {
  if (pool) await pool.end()
  pool = undefined
}

export async function ensureSchema() {
  const db = getPool()
  if (!db) throw new Error('DATABASE_URL is not configured')
  await db.query(`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      content_key TEXT PRIMARY KEY,
      content_value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'portfolio-contact',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS intent TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON contact_submissions (created_at DESC);
  `)
  return true
}

export async function getContent() {
  const db = getPool()
  if (!db) throw new Error('DATABASE_URL is not configured')
  const result = await db.query('SELECT content_key, content_value FROM portfolio_content ORDER BY content_key')
  return Object.fromEntries(result.rows.map((row) => [row.content_key, row.content_value]))
}

export async function saveContent(contentKey, value) {
  const db = getPool()
  if (!db) throw new Error('DATABASE_URL is not configured')
  await db.query(
    `INSERT INTO portfolio_content (content_key, content_value) VALUES ($1, $2::jsonb)
     ON CONFLICT (content_key) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = NOW()`,
    [contentKey, JSON.stringify(value)],
  )
}

export async function getSubmissions() {
  const db = getPool()
  if (!db) throw new Error('DATABASE_URL is not configured')
  const result = await db.query('SELECT id, name, email, message, intent, source, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 250')
  return result.rows
}

export async function saveContact({ name, email, message, intent = '' }) {
  const db = getPool()
  if (!db) throw new Error('DATABASE_URL is not configured')
  await db.query(
    'INSERT INTO contact_submissions (name, email, message, intent) VALUES ($1, $2, $3, $4)',
    [name, email, message, intent],
  )
}
