const clients = new Set()

export function addLiveClient(res) {
  clients.add(res)
  res.on('close', () => clients.delete(res))
  res.write(`event: ready\ndata: ${JSON.stringify({ revision: Date.now() })}\n\n`)
}

export function broadcastContentUpdate(payload = {}) {
  const message = `event: content-updated\ndata: ${JSON.stringify({ revision: Date.now(), ...payload })}\n\n`
  for (const client of clients) {
    try { client.write(message) } catch { clients.delete(client) }
  }
}

export function keepLiveClients() {
  for (const client of clients) {
    try { client.write(': keepalive\n\n') } catch { clients.delete(client) }
  }
}

setInterval(keepLiveClients, 25_000).unref()
