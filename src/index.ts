import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import process from 'node:process'
import { migrate } from '@/db/migrator'
import { logger } from '@/middlewares/logger'
import { useRoutes } from '@/routing'

const DEFAULT_PORT = 3000

// Here we are applying codebase first approach (Option 4) for migration.
// Read more at https://orm.drizzle.team/docs/migrations.
migrate()

const app = new Hono()
app.use(logger())
app.use(secureHeaders())
useRoutes(app)

export default {
  fetch: app.fetch,
  request: app.request,
  port: process.env.PORT || DEFAULT_PORT,
}
