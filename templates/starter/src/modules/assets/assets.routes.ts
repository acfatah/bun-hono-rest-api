/**
 * Serve static assets from the 'public' directory.
 */

import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

export const assetsRoute = new Hono()

assetsRoute.get('*', serveStatic({ root: './public' }))
