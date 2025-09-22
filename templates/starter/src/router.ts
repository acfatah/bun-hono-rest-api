import type { Hono } from 'hono'
import { assetsRoutes } from '@/modules/assets/assets.routes'
import { uploadRoutes } from '@/modules/upload/upload.routes'
import { healthRoutes } from './routes/health'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoutes)
  app.route('/upload', uploadRoutes)

  // Home route
  app.get('/', ctx => ctx.json({
    message: 'API is running',
  }))

  // Serve static files under public directory
  app.route('/', assetsRoutes)

  return app
}
