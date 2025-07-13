import { Hono } from 'hono'
import { session } from '@/middlewares/session'

export const protectedRoute = new Hono()

protectedRoute.get('/', session(), (ctx) => {
  return ctx.json({
    message: 'This is a protected route',
  })
})
