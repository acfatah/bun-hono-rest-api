import type { Hono } from 'hono'
import { healthRoute } from '@/routes/health'
import { indexRoute } from '@/routes/index'
import { staticRoute } from '@/routes/public'
import { uploadRoute } from '@/routes/upload'

import { auth } from '@/lib/auth'

export function useRoutes(app: Hono) {
  app.route('/health', healthRoute)
  app.route('/upload', uploadRoute)
  app.route('/', indexRoute)

  // Auth handler
  app.on(['POST', 'GET'], '/api/auth/**', ctx => auth.handler(ctx.req.raw))

  // Serve static files under public directory
  app.route('/', staticRoute)

  return app
}
