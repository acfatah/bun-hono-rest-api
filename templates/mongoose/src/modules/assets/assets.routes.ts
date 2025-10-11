/**
 * Serve static assets from the 'public' directory.
 */

import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

export const assetsRoutes = new Hono()

assetsRoutes.get('*', serveStatic({ root: './public' }))
