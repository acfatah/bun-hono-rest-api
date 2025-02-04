import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { useRoutes } from './routes'

const app = new Hono()
app.use(logger())

useRoutes(app)

export default app
