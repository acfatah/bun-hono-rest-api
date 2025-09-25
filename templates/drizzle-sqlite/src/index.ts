import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { migrate } from '@/db/migrator'
import { handleOrigin } from '@/middleware/cors-utils'
import { logger } from '@/middleware/logger'
import { useRoutes } from '@/router'
import { env } from './config/env'

const DEFAULT_PORT = 3000

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

// Here we are applying codebase first approach (Option 4) for migration.
// Read more at https://orm.drizzle.team/docs/migrations.
migrate()

const app = createApp()

export default {
  fetch: app.fetch,
  request: app.request,
  port: env.PORT || DEFAULT_PORT,
}
