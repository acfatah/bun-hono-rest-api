import type { Hono } from 'hono'
import { assetsRoutes } from '@/modules/assets/assets.routes'
import { healthRoutes } from '@/modules/health/health.routes'
import { uploadRoutes } from '@/modules/upload/upload.routes'

import { session } from '@/middleware/session'
import { auth } from '@/modules/auth/auth.provider'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoutes)
  app.route('/upload', uploadRoutes)

  // Home route
  app.get('/', ctx => ctx.json({
    message: 'API is running',
  }))

  // Auth handler
  app.on(['POST', 'GET'], '/api/auth/*', ctx => auth.handler(ctx.req.raw))

  // Example signed in routes
  app.get('/protected', session(), ctx => ctx.json({
    message: 'This is a protected route',
  }))

  // Serve static files under public directory
  app.route('/', assetsRoutes)

  return app
}
