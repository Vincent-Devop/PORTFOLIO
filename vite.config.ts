import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

async function neonApiPlugin() {
  // @ts-expect-error The middleware is a Node-only runtime module.
  const { createApiHandler } = await import('./server/api.mjs')
  return {
    name: 'vincey-neon-api',
    configureServer(server: { middlewares: { use: (...args: unknown[]) => void } }) {
      server.middlewares.use(createApiHandler())
    },
  }
}

export default defineConfig({
  plugins: [react(), await neonApiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    // The managed Preview proxy does not reliably forward Vite HMR websockets.
    // Disable HMR so the preview remains stable; production is unaffected.
    hmr: false,
  },
})
