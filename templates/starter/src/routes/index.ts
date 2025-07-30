import { Hono } from 'hono'

export const indexRoute = new Hono()

indexRoute.get('/', (ctx) => {
  return ctx.json({
    message: 'API is running',
  })
})
