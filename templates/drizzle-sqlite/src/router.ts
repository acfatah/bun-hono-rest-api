import type { Hono } from 'hono'
import { assetsRoute } from '@/modules/assets/assets.routes'
import { healthRoute } from '@/modules/health/health.routes'
import { uploadRoute } from '@/modules/upload/upload.routes'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoute)
  app.route('/upload', uploadRoute)

  // Home route
  app.get('/', ctx => ctx.json({
    message: 'API is running',
  }))

  // Serve static files under public directory
  app.route('/', assetsRoute)

  return app
}
