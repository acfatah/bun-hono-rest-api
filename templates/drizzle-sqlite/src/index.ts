import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import process from 'node:process'
import { migrate } from '@/db/migrator'
import { handleOrigin } from '@/middlewares/cors-utils'
import { logger } from '@/middlewares/logger'
import { useRoutes } from '@/router'

const DEFAULT_PORT = 3000

// Here we are applying codebase first approach (Option 4) for migration.
// Read more at https://orm.drizzle.team/docs/migrations.
migrate()

const app = new Hono()
app.use(logger())

app.use('/api/*', cors({
  origin: handleOrigin,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  credentials: true,
}))

app.use(secureHeaders())
useRoutes(app)

export default {
  fetch: app.fetch,
  request: app.request,
  port: process.env.PORT || DEFAULT_PORT,
}
