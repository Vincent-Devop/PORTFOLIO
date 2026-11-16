import crypto from 'node:crypto'

const buckets = new Map()

export function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self' wss:; object-src 'none'")
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
}

export function clientKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.socket?.remoteAddress || 'unknown'
}

export function allowRate(req, scope, limit, windowMs) {
  const now = Date.now()
  const key = `${scope}:${clientKey(req)}`
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (existing.count >= limit) return false
  existing.count += 1
  return true
}

export function sameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    const originUrl = new URL(origin)
    const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim()
    const requestHost = forwardedHost || req.headers.host
    if (originUrl.host === requestHost) return true
    const hostname = originUrl.hostname.toLowerCase()
    const trustedManusHost = hostname === 'manus.im' || hostname.endsWith('.manus.im') || hostname === 'manus.com' || hostname.endsWith('.manus.com')
    const trustedPreview = hostname.endsWith('.manus.computer') || hostname.endsWith('.manus.space')
    return trustedManusHost || trustedPreview
  } catch {
    return false
  }
}

export function secureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}
