import type { Hono } from 'hono'
import { healthRoute } from './health'
import { staticRoute } from './public'
import { uploadRoute } from './upload'

export function useRoutes(app: Hono) {
  app.route('/', healthRoute)
  app.route('/', staticRoute)
  app.route('/', uploadRoute)

  return app
}
