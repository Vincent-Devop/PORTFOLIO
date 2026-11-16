import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiHandler } from './server/api.mjs'
import { ensureSchema } from './server/db.mjs'
import { setSecurityHeaders } from './server/security.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
const dist = join(root, 'dist')
const port = Number(process.env.PORT || 3000)

if (process.env.NODE_ENV === 'production') {
  const missing = ['DATABASE_URL', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'].filter((key) => !process.env[key])
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`)
  if (String(process.env.ADMIN_SESSION_SECRET).length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters in production')
}

const api = createApiHandler()
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf' }

async function serve(req, res) {
  if (req.url?.startsWith('/api/')) return api(req, res)
  const pathname = new URL(req.url || '/', 'http://localhost').pathname
  const requested = normalize(join(dist, pathname === '/' ? 'index.html' : pathname.slice(1)))
  const fromRoot = relative(dist, requested)
  const insideDist = fromRoot === '' || (!fromRoot.startsWith('..') && !fromRoot.includes(`..${process.platform === 'win32' ? '\\' : '/'}`))
  const file = insideDist && existsSync(requested) ? requested : join(dist, 'index.html')
  try {
    const body = await readFile(file)
    res.statusCode = 200
    setSecurityHeaders(res)
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
    res.setHeader('Cache-Control', extname(file) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable')
    res.end(body)
  } catch {
    res.statusCode = 500
    setSecurityHeaders(res)
    res.end('VINCEY server error')
  }
}

async function start() {
  if (process.env.DATABASE_URL) await ensureSchema()
  http.createServer(serve).listen(port, '0.0.0.0', () => console.log(`VINCEY server listening on ${port}`))
}

start().catch((error) => {
  console.error('[vincey-startup]', error)
  process.exitCode = 1
})
