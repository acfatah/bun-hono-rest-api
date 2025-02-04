import type { Hono } from 'hono'
import { healthRoute } from './health'
import { staticRoute } from './public'

export function useRoutes(app: Hono) {
  app.route('/', healthRoute)
  app.route('/', staticRoute)

  return app
}
