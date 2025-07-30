import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

export const staticRoute = new Hono()

staticRoute.get('*', serveStatic({ root: './public' }))
