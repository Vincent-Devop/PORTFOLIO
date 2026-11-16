import crypto from 'node:crypto'
import { getContent, getPool, getSubmissions, saveContent } from './db.mjs'
import { allowRate, sameOrigin, setSecurityHeaders } from './security.mjs'
import { broadcastContentUpdate } from './live.mjs'

const cookieName = 'vincey_admin'
const sessionTtlMs = 1000 * 60 * 60 * 12

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex')
}

function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function makeSession() {
  const value = `${Date.now() + sessionTtlMs}.${crypto.randomBytes(12).toString('hex')}`
  return `${value}.${sign(value)}`
}

function cookieSecurity(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim()
  const publicHost = String(req.headers.host || '').includes('manus.')
  return forwardedProto === 'https' || publicHost ? 'SameSite=None; Secure' : 'SameSite=Lax'
}

function validSession(req) {
  if (!secret()) return false
  const header = req.headers.cookie || ''
  const raw = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
  if (!raw) return false
  const parts = raw.split('.')
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false
  const expected = sign(`${parts[0]}.${parts[1]}`)
  return constantTimeEqual(parts[2], expected)
}

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
    if (body.length > 100_000) throw new Error('Request body too large')
  }
  return JSON.parse(body || '{}')
}

function safeProject(input, existing = {}) {
  const text = (value, max) => String(value ?? '').trim().slice(0, max)
  return {
    ...existing,
    slug: text(input.slug ?? existing.slug, 80).toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    title: text(input.title ?? existing.title, 120),
    kicker: text(input.kicker ?? existing.kicker, 160),
    description: text(input.description ?? existing.description, 500),
    status: text(input.status ?? existing.status, 40) || 'Planned',
    liveUrl: text(input.liveUrl ?? existing.liveUrl, 500) || null,
    currentStatus: text(input.currentStatus ?? existing.currentStatus, 800),
  }
}

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const maxImageBytes = 8 * 1024 * 1024
const documentTypes = new Set(['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
const maxDocumentBytes = 25 * 1024 * 1024

const defaultDocuments = {
  cv: { id: 'default-cv', kind: 'cv', title: 'Vincent Nyakundi CV', description: 'The current professional CV for Vincent Nyakundi.', url: '/vincent-nyakundi-cv.pdf', fileName: 'vincent-nyakundi-cv.pdf', contentType: 'application/pdf' },
  presentations: [],
}

function getDocuments(content) {
  const documents = content.portfolio?.documents || {}
  return { ...defaultDocuments, ...documents, presentations: Array.isArray(documents.presentations) ? documents.presentations : [] }
}

function safeFileName(value) {
  return String(value || 'project-image').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 100) || 'project-image'
}

async function presignStoragePut(key) {
  if (!process.env.MANUS_API_URL || !process.env.MANUS_API_KEY) throw new Error('Managed object storage is not configured.')
  const response = await fetch(`${process.env.MANUS_API_URL}/v1/storage/presign/put?path=${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${process.env.MANUS_API_KEY}` } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.url) throw new Error(body.error || 'Could not prepare image storage.')
  return body.url
}

export function createAdminHandler() {
  return async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/admin')) return false

    try {
      if (url.pathname === '/api/admin/login' && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        if (!allowRate(req, 'admin-login', 5, 15 * 60 * 1000)) return json(res, 429, { ok: false, error: 'Too many login attempts. Please try again later.' })
        const input = await readBody(req)
        if (!process.env.ADMIN_PASSWORD || !input.password || !constantTimeEqual(input.password, process.env.ADMIN_PASSWORD)) return json(res, 401, { ok: false, error: 'Invalid admin password.' })
        res.setHeader('Set-Cookie', `${cookieName}=${makeSession()}; HttpOnly; ${cookieSecurity(req)}; Path=/; Max-Age=${sessionTtlMs / 1000}`)
        return json(res, 200, { ok: true })
      }
      if (url.pathname === '/api/admin/logout' && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; ${cookieSecurity(req)}; Path=/; Max-Age=0`)
        return json(res, 200, { ok: true })
      }
      if (!validSession(req)) return json(res, 401, { ok: false, error: 'Admin authentication required.' })
      if (!getPool()) return json(res, 503, { ok: false, error: 'Database is not configured yet.' })
      if (url.pathname === '/api/admin/documents' && req.method === 'GET') {
        const content = await getContent()
        return json(res, 200, { ok: true, documents: getDocuments(content) })
      }
      if (url.pathname === '/api/admin/documents/presign' && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const input = await readBody(req)
        const kind = input.kind === 'cv' ? 'cv' : input.kind === 'presentation' ? 'presentation' : ''
        const contentType = String(input.contentType || '').toLowerCase()
        const bytes = Number(input.bytes || 0)
        if (!kind || !documentTypes.has(contentType)) return json(res, 400, { ok: false, error: 'Use a PDF, PPT, or PPTX document.' })
        if (kind === 'cv' && contentType !== 'application/pdf') return json(res, 400, { ok: false, error: 'The CV must be a PDF.' })
        if (!Number.isFinite(bytes) || bytes <= 0 || bytes > maxDocumentBytes) return json(res, 400, { ok: false, error: 'Documents must be smaller than 25 MB.' })
        const key = `vincey/documents/${kind === 'cv' ? 'cv' : 'presentations'}/${crypto.randomUUID()}-${safeFileName(input.filename || 'document')}`
        const uploadUrl = await presignStoragePut(key)
        return json(res, 200, { ok: true, uploadUrl, key, stableUrl: `/manus-storage/${key}` })
      }
      if (url.pathname === '/api/admin/documents' && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const input = await readBody(req)
        const kind = input.kind === 'cv' ? 'cv' : input.kind === 'presentation' ? 'presentation' : ''
        const contentType = String(input.contentType || '').toLowerCase()
        const bytes = Number(input.bytes || 0)
        const key = String(input.key || '')
        const prefix = `vincey/documents/${kind === 'cv' ? 'cv' : 'presentations'}/`
        const title = String(input.title || '').trim().slice(0, 180)
        const description = String(input.description || '').trim().slice(0, 500)
        if (!kind || !title || !documentTypes.has(contentType) || (kind === 'cv' && contentType !== 'application/pdf') || !key.startsWith(prefix) || !Number.isFinite(bytes) || bytes <= 0 || bytes > maxDocumentBytes) return json(res, 400, { ok: false, error: 'Invalid document metadata.' })
        const content = await getContent()
        const documents = getDocuments(content)
        const document = { id: crypto.randomUUID(), kind, title, description, key, url: `/manus-storage/${key}`, fileName: safeFileName(input.fileName || 'document'), contentType, bytes, updatedAt: new Date().toISOString() }
        const nextDocuments = kind === 'cv' ? { ...documents, cv: document } : { ...documents, presentations: [document, ...documents.presentations].slice(0, 24) }
        await saveContent('portfolio', { ...(content.portfolio || {}), documents: nextDocuments })
        broadcastContentUpdate({ source: kind === 'cv' ? 'cv-updated' : 'presentation-added', id: document.id })
        return json(res, 200, { ok: true, document, documents: nextDocuments })
      }
      const documentMatch = url.pathname.match(/^\/api\/admin\/documents\/([^/]+)$/)
      if (documentMatch && req.method === 'DELETE') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const content = await getContent()
        const documents = getDocuments(content)
        if (!documents.presentations.some((item) => item.id === documentMatch[1])) return json(res, 404, { ok: false, error: 'Presentation not found.' })
        const nextDocuments = { ...documents, presentations: documents.presentations.filter((item) => item.id !== documentMatch[1]) }
        await saveContent('portfolio', { ...(content.portfolio || {}), documents: nextDocuments })
        broadcastContentUpdate({ source: 'presentation-removed', id: documentMatch[1] })
        return json(res, 200, { ok: true, documents: nextDocuments })
      }
      if (url.pathname === '/api/admin/editorial' && req.method === 'GET') {
        const content = await getContent()
        return json(res, 200, { ok: true, editorial: content.editorial || {} })
      }
      if (url.pathname === '/api/admin/editorial' && req.method === 'PUT') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const input = await readBody(req)
        const allowed = ['systemNodes', 'buildStates', 'decisions', 'systemTelemetry', 'intentFilters', 'systemAnswers', 'notebookEntries', 'learningTriad', 'contactIntents']
        const editorial = Object.fromEntries(allowed.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]))
        await saveContent('editorial', editorial)
        broadcastContentUpdate({ source: 'editorial' })
        return json(res, 200, { ok: true, editorial })
      }

      if (url.pathname === '/api/admin/submissions' && req.method === 'GET') return json(res, 200, { ok: true, submissions: await getSubmissions() })
      if (url.pathname === '/api/admin/projects' && req.method === 'GET') {
        const content = await getContent()
        return json(res, 200, { ok: true, projects: content.portfolio?.projects || [] })
      }
      if (url.pathname === '/api/admin/projects' && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const input = await readBody(req)
        const content = await getContent()
        const projects = Array.isArray(content.portfolio?.projects) ? content.portfolio.projects : []
        const project = safeProject(input, { stack: [], objectives: [], implementation: [], tradeoffs: [], resources: [], overview: '', problem: '', solution: '', architecture: '', result: '' })
        if (!project.slug || !project.title || projects.some((item) => item.slug === project.slug)) return json(res, 400, { ok: false, error: 'A unique slug and title are required.' })
        const next = { ...(content.portfolio || {}), projects: [...projects, project] }
        await saveContent('portfolio', next)
        broadcastContentUpdate({ source: 'project-created', slug: project.slug })
        return json(res, 201, { ok: true, project })
      }
      const imagePresignMatch = url.pathname.match(/^\/api\/admin\/projects\/([^/]+)\/images\/presign$/)
      if (imagePresignMatch && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const slug = imagePresignMatch[1]
        const input = await readBody(req)
        const contentType = String(input.contentType || '').toLowerCase()
        const bytes = Number(input.bytes || 0)
        if (!imageTypes.has(contentType)) return json(res, 400, { ok: false, error: 'Use a JPG, PNG, WebP, or AVIF image.' })
        if (!Number.isFinite(bytes) || bytes <= 0 || bytes > maxImageBytes) return json(res, 400, { ok: false, error: 'Images must be smaller than 8 MB.' })
        const content = await getContent()
        if (!content.portfolio?.projects?.some((item) => item.slug === slug)) return json(res, 404, { ok: false, error: 'Project not found.' })
        const key = `vincey/projects/${slug}/${crypto.randomUUID()}-${safeFileName(input.filename)}`
        const uploadUrl = await presignStoragePut(key)
        return json(res, 200, { ok: true, uploadUrl, key, stableUrl: `/manus-storage/${key}` })
      }
      const imageFinalizeMatch = url.pathname.match(/^\/api\/admin\/projects\/([^/]+)\/images$/)
      if (imageFinalizeMatch && req.method === 'POST') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const slug = imageFinalizeMatch[1]
        const input = await readBody(req)
        const key = String(input.key || '')
        const contentType = String(input.contentType || '').toLowerCase()
        const bytes = Number(input.bytes || 0)
        if (!key.startsWith(`vincey/projects/${slug}/`) || !imageTypes.has(contentType) || !Number.isFinite(bytes) || bytes <= 0 || bytes > maxImageBytes) return json(res, 400, { ok: false, error: 'Invalid uploaded image metadata.' })
        const content = await getContent()
        const projects = Array.isArray(content.portfolio?.projects) ? content.portfolio.projects : []
        const index = projects.findIndex((item) => item.slug === slug)
        if (index < 0) return json(res, 404, { ok: false, error: 'Project not found.' })
        const image = { key, url: `/manus-storage/${key}`, role: String(input.role || 'hero').slice(0, 40), alt: String(input.alt || `${projects[index].title} project image`).slice(0, 180), fileName: safeFileName(input.fileName), contentType, bytes, updatedAt: new Date().toISOString() }
        const currentImages = Array.isArray(projects[index].images) ? projects[index].images : []
        const images = [...currentImages.filter((item) => item.role !== image.role), image].slice(-8)
        const updated = { ...projects[index], images }
        const nextProjects = projects.map((item, itemIndex) => itemIndex === index ? updated : item)
        await saveContent('portfolio', { ...(content.portfolio || {}), projects: nextProjects })
        broadcastContentUpdate({ source: 'project-image', slug })
        return json(res, 200, { ok: true, project: updated, image })
      }
      const projectMatch = url.pathname.match(/^\/api\/admin\/projects\/([^/]+)$/)
      if (projectMatch && req.method === 'PUT') {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Cross-origin requests are not allowed.' })
        const input = await readBody(req)
        const content = await getContent()
        const projects = Array.isArray(content.portfolio?.projects) ? content.portfolio.projects : []
        const index = projects.findIndex((item) => item.slug === projectMatch[1])
        if (index < 0) return json(res, 404, { ok: false, error: 'Project not found.' })
        const updated = safeProject(input, projects[index])
        const nextProjects = projects.map((item, itemIndex) => itemIndex === index ? updated : item)
        await saveContent('portfolio', { ...(content.portfolio || {}), projects: nextProjects })
        broadcastContentUpdate({ source: 'project-updated', slug: updated.slug })
        return json(res, 200, { ok: true, project: updated })
      }
      return json(res, 404, { ok: false, error: 'Not found' })
    } catch (error) {
      console.error('[vincey-admin]', error)
      return json(res, 500, { ok: false, error: 'Admin request failed.' })
    }
  }
}
