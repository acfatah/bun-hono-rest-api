import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { handleOrigin } from '@/middleware/cors-utils'
import { logger } from '@/middleware/logger'
import { useRoutes } from '@/router'

export function createApp() {
  const app = new Hono()
  app.use(logger())

  app.use('/api/*', cors({
    origin: handleOrigin,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    credentials: true,
  }))

  app.use(secureHeaders())
  useRoutes(app)

  return app
}
