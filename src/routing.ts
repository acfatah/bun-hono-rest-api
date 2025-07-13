import type { Hono } from 'hono'
import { healthRoute } from '@/routes/health'
import { indexRoute } from '@/routes/index'
import { staticRoute } from '@/routes/public'
import { uploadRoute } from '@/routes/upload'

import { auth } from '@/lib/auth'

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
  app.route('/', staticRoute)

  return app
}
