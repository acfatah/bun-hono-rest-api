import type { Hono } from 'hono'
import { assetsRoutes } from '@/modules/assets/assets.routes'
import { healthRoutes } from '@/modules/health/health.routes'
import { sessionRoutes } from '@/modules/session/session.routes'
import { uploadRoutes } from '@/modules/upload/upload.routes'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoutes)
  app.route('/upload', uploadRoutes)
  app.route('/*', sessionRoutes)

  // Home route
  app.get('/', ctx => ctx.json({
    message: 'API is running',
  }))

  // Serve static files under public directory
  app.route('/', assetsRoutes)

  return app
}
