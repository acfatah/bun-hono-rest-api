import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import process from 'node:process'
import { useRoutes } from './routing'

// Drizzle sqlite migrator
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { db } from '@/lib/sqlite'
import drizzleConfig from '../drizzle.config'

const DEFAULT_PORT = 3000

// Here we are applying codebase first approach (Option 4) for migration.
// Read more at https://orm.drizzle.team/docs/migrations.
try {
  migrate(db, { migrationsFolder: drizzleConfig.out || './drizzle' })
}
catch (error) {
  if (error instanceof Error && error.message.match(/Can't find meta\/_journal\.json file/))
    console.warn('Please run `bun db:init` to initialize the database.')
  else
    console.error(error)

  process.exit(1)
}

const app = new Hono()
app.use(logger())
app.use(secureHeaders())
useRoutes(app)

export default {
  fetch: app.fetch,
  request: app.request,
  port: process.env.PORT || DEFAULT_PORT,
}
