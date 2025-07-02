import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import process from 'node:process'
import { useRoutes } from './routes'

const app = new Hono()
app.use(logger())
app.use(secureHeaders())
useRoutes(app)

export default {
  fetch: app.fetch,
  request: app.request,
  port: process.env.PORT || 3000,
}
