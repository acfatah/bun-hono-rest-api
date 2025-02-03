import { Hono } from 'hono'
import { useRoutes } from './routes'

const app = new Hono()

useRoutes(app)

export default app
