import { createMiddleware } from 'hono/factory'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/types'
import { env } from '@/config/env'

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
    const tempRes = new Response()
    const iron = await getIronSession<SessionData>(
      ctx.req.raw,
      tempRes,
      {
        password: env.APP_SECRET,
        cookieName: env.SESSION_COOKIE_NAME,
      },
    )

    // Expose the whole iron session on request for test usage / downstream handlers
    // @ts-expect-error augmenting request for convenience
    ctx.req.session = iron

    if (!iron?.session?.user) {
      const unauthorized = ctx.json({ error: 'Unauthorized' }, 401)
      const setCookie = tempRes.headers.get('set-cookie')
      if (setCookie)
        unauthorized.headers.set('Set-Cookie', setCookie)

      return unauthorized
    }

    if (
      env.SESSION_INVALIDATION_KEY
      && iron.session.invalidationKey !== env.SESSION_INVALIDATION_KEY
    ) {
      iron.session = null
      await iron.save()

      const unauthorized = ctx.json({ error: 'Unauthorized' }, 401)
      const setCookie = tempRes.headers.get('set-cookie')
      if (setCookie)
        unauthorized.headers.set('Set-Cookie', setCookie)

      return unauthorized
    }

    ctx.set('session', iron)

    const setCookie = tempRes.headers.get('set-cookie')
    if (setCookie)
      ctx.header('Set-Cookie', setCookie)

    return next()
  })
}
