import { getContent, getPool, saveContact } from './db.mjs'
import { createAdminHandler } from './admin.mjs'
import { allowRate, sameOrigin, setSecurityHeaders } from './security.mjs'
import { addLiveClient } from './live.mjs'

const adminHandler = createAdminHandler()

function json(res, status, payload) {
  res.statusCode = status
  setSecurityHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 40_000) throw new Error('Request body too large')
  }
  return JSON.parse(body || '{}')
}

export function createApiHandler() {
  return async (req, res, next) => {
    const url = new URL(req.url || '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/')) return next?.()
    if (url.pathname.startsWith('/api/admin')) return adminHandler(req, res)

    if (url.pathname === '/api/health' && req.method === 'GET') {
      const db = getPool()
      if (!db) return json(res, 503, { ok: false, databaseConfigured: false, databaseReachable: false })
      try {
        await db.query('SELECT 1')
        return json(res, 200, { ok: true, databaseConfigured: true, databaseReachable: true })
      } catch {
        return json(res, 503, { ok: false, databaseConfigured: true, databaseReachable: false })
      }
    }

    if (url.pathname === '/api/content/stream' && req.method === 'GET') {
      setSecurityHeaders(res)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders?.()
      addLiveClient(res)
      return true
    }

    if (!getPool()) return json(res, 503, { ok: false, error: 'Database is not configured yet.' })

    try {
      if (url.pathname === '/api/content' && req.method === 'GET') {
        return json(res, 200, { ok: true, content: await getContent() })
      }

      if (url.pathname === '/api/contact' && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        if (!allowRate(req, 'contact', 6, 60 * 60 * 1000)) return json(res, 429, { ok: false, error: 'Too many messages from this address. Please try again later.' })
        const input = await readBody(req)
        if (String(input.website || '').trim()) return json(res, 200, { ok: true })
        const name = String(input.name || '').trim().slice(0, 120)
        const email = String(input.email || '').trim().toLowerCase().slice(0, 240)
        const message = String(input.message || '').trim().slice(0, 8_000)
        const intent = String(input.intent || '').trim().slice(0, 120)
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: 'Please provide a valid email address.' })
        if (!message || message.length < 10) return json(res, 400, { ok: false, error: 'Please provide a little more detail.' })
        await saveContact({ name, email, message, intent })
        return json(res, 201, { ok: true })
      }

      return json(res, 404, { ok: false, error: 'Not found' })
    } catch (error) {
      console.error('[vincey-api]', error)
      return json(res, 500, { ok: false, error: 'The request could not be completed.' })
    }
  }
}
