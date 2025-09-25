import { createMiddleware } from 'hono/factory'
import { build, validate } from '@/modules/session/session.provider'

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
    const { session, response } = await build(ctx.req.raw)
    const { valid, unauthorizedResponse } = validate(ctx, session)

    if (!valid)
      return unauthorizedResponse

    // Expose the whole iron session on request for test usage / downstream handlers
    ctx.req.session = session

    ctx.set('session', session)

    const setCookie = response.headers.get('set-cookie')
    if (setCookie)
      ctx.header('Set-Cookie', setCookie)

    return next()
  })
}
