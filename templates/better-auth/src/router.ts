import type { Hono } from 'hono'
import { assetsRoute } from '@/modules/assets/assets.routes'
import { uploadRoute } from '@/modules/upload/upload.routes'
import { healthRoute } from '@/routes/health'
import { indexRoute } from '@/routes/index'

import { auth } from '@/modules/auth/auth.provider'

// Example route that require auth
import { protectedRoute } from '@/routes/protected'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoute)
  app.route('/upload', uploadRoute)
  app.route('/', indexRoute)

  // Auth handler
  app.on(['POST', 'GET'], '/api/auth/**', ctx => auth.handler(ctx.req.raw))

  // Example signed in routes
  app.route('/protected', protectedRoute)

  // Serve static files under public directory
  app.route('/', assetsRoute)

  return app
}
