import type { Hono } from 'hono'
import { assetsRoute } from '@/modules/assets/assets.routes'
import { uploadRoute } from '@/modules/upload/upload.routes'
import { healthRoute } from './routes/health'
import { indexRoute } from './routes/index'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoute)
  app.route('/upload', uploadRoute)
  app.route('/', indexRoute)

  // Serve static files under public directory
  app.route('/', assetsRoute)

  return app
}
