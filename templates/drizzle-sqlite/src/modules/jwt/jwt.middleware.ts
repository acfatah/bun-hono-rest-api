import { createMiddleware } from 'hono/factory'
import { verifyToken } from './jwt.service'

interface JwtMiddlewareOptions {
  required?: boolean
  /** Custom header name (default: Authorization) */
  header?: string
  /** If true, silently continue on invalid token */
  passthroughOnError?: boolean
}

export function jwt(options: JwtMiddlewareOptions = {}) {
  const {
    required = false,
    header = 'authorization',
    passthroughOnError = false,
  } = options

  return createMiddleware(async (c, next) => {
    const raw = c.req.header(header)
    const token = raw?.startsWith('Bearer ') ? raw.slice(7).trim() : undefined

    if (!token) {
      if (required)
        return c.json({ error: 'Missing token' }, 401)

      return next()
    }

    try {
      const claims = await verifyToken(token)
      c.set('jwtClaims', claims)
    }
    catch {
      if (required && !passthroughOnError)
        return c.json({ error: 'Invalid token' }, 401)
    }

    return next()
  })
}
