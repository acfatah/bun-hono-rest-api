import type { Hono } from 'hono'
import { assetsRoute } from '@/modules/assets/assets.routes'
import { healthRoute } from '@/modules/health/health.routes'
import { uploadRoute } from '@/modules/upload/upload.routes'

import { session } from '@/middleware/session'
import { auth } from '@/modules/auth/auth.provider'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoute)
  app.route('/upload', uploadRoute)

  // Home route
  app.get('/', ctx => ctx.json({
    message: 'API is running',
  }))

  // Auth handler
  app.on(['POST', 'GET'], '/api/auth/**', ctx => auth.handler(ctx.req.raw))

  // Example signed in routes
  app.get('/protected', session(), ctx => ctx.json({
    message: 'This is a protected route',
  }))

  // Serve static files under public directory
  app.route('/', assetsRoute)

  return app
}
