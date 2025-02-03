import type { Hono } from 'hono'
import { healthRoute } from './health'

export function useRoutes(app: Hono) {
  app.route('/', healthRoute)

  return app
}
