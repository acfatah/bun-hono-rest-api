import { createMiddleware } from 'hono/factory'
import { loadSession, validate } from '@/modules/session/session.service'

/**
 * Middleware factory that validates an Iron session and exposes it to downstream handlers.
 *
 * See: https://github.com/vvo/iron-session
 *
 * Remarks:
 * - This factory returns a middleware that performs side effects on the request
 *   (ctx.req.session) and the context headers (Set-Cookie), and may short-circuit
 *   the request lifecycle with a 401 response.
 * - Ensure env.APP_SECRET and env.SESSION_COOKIE_NAME are securely configured.
 *
 * @returns A middleware function that enforces an authenticated session, exposes session data,
 *          and correctly propagates Set-Cookie headers from the session store.
 */
export function session() {
  return createMiddleware(async (ctx, next) => {
    const { session, setCookie } = await loadSession(ctx)
    const { valid, unauthorizedResponse } = await validate(ctx, session)

    if (!valid)
      return unauthorizedResponse

    ctx.set('session', session)
    setCookie(ctx.res)

    return next()
  })
}
