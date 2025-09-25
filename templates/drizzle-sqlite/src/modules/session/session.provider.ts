import type { Context } from 'hono'
import type { IronSession } from 'iron-session'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/types'
import { env } from '@/config/env'

/**
 * Builds an iron-session instance for the incoming request.
 */
export async function build(rawReq: Request) {
  const response = new Response()
  const session = await getIronSession<SessionData>(rawReq, response, {
    password: env.APP_SECRET,
    cookieName: env.SESSION_COOKIE_NAME,
  })

  return { session, response }
}

/**
 * Validates the session according to current business rules.
 */
export function validate(ctx: Context, session: IronSession<SessionData>) {
  const response = new Response()

  // Helper to destroy session and build unauthorized response
  const unauthorize = async () => {
    session.destroy()

    const unauthorized = ctx.json({ error: 'Unauthorized' }, 401)
    const setCookie = response.headers.get('set-cookie')
    if (setCookie)
      unauthorized.headers.set('Set-Cookie', setCookie)

    return unauthorized
  }

  // No session or no user means not authenticated
  if (!session?.user)
    return { valid: false, unauthorizedResponse: unauthorize() }

  // Session expired
  if (Date.now() > session.expiresAt)
    return { valid: false, unauthorizedResponse: unauthorize() }

  // Invalidation key mismatch means existing session is no longer valid
  if (
    env.SESSION_INVALIDATION_KEY
    && session.invalidationKey !== env.SESSION_INVALIDATION_KEY
  ) {
    return { valid: false, unauthorizedResponse: unauthorize() }
  }

  return { valid: true }
}
