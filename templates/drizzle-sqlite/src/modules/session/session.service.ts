import type { Context } from 'hono'
import type { IronSession } from 'iron-session'
import { getConnInfo } from 'hono/bun'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/types'
import { env } from '@/config/env'

function getClientIp(ctx: Context) {
  // Check Cloudflare-specific header first
  const cloudflareIp = ctx.req.header('cf-connecting-ip')
  if (cloudflareIp)
    return cloudflareIp

  // Check general proxy header
  const realIp = ctx.req.header('x-real-ip')
  if (realIp)
    return realIp

  // Fall back to hono connection info
  try {
    const info = getConnInfo(ctx)

    return info?.remote?.address || null
  }
  catch {
    return null
  }
}

export async function createSession(ctx: Context) {
  const now = Math.floor(Date.now() / 1000)
  // Temporary response to capture set-cookie header
  const tempRes = new Response()
  const session = await getIronSession<SessionData>(
    ctx.req.raw,
    tempRes,
    {
      password: env.APP_SECRET,
      cookieName: env.SESSION_COOKIE_NAME,
      ttl: env.SESSION_TTL,
    },
  )

  session.ipAddress = getClientIp(ctx)

  if (!session.createdAt)
    session.createdAt = now

  if (!session.expiresAt)
    session.expiresAt = now + env.SESSION_TTL

  if (env.SESSION_INVALIDATION_KEY)
    session.invalidationKey = env.SESSION_INVALIDATION_KEY

  return {
    session,

    setCookie(response: Response) {
      const cookies = tempRes.headers.getSetCookie()
      if (cookies.length > 0) {
        cookies.forEach((cookie, idx) => {
          if (idx === 0)
            response.headers.set('set-cookie', cookie)
          else
            response.headers.append('set-cookie', cookie)
        })
      }

      return response
    },

    getCookie: () => {
      return tempRes.headers.get('set-cookie')
    },
  }
}

/**
 * Loads an iron-session instance for the incoming request.
 */
export async function loadSession(ctx: Context) {
  const tempRes = new Response()
  const session = await getIronSession<SessionData>(ctx.req.raw, tempRes, {
    password: env.APP_SECRET,
    cookieName: env.SESSION_COOKIE_NAME,
    ttl: env.SESSION_TTL,
  })

  return {
    session,

    setCookie(response: Response) {
      const cookies = tempRes.headers.getSetCookie()
      if (cookies.length > 0) {
        cookies.forEach((cookie, idx) => {
          if (idx === 0)
            response.headers.set('set-cookie', cookie)
          else
            response.headers.append('set-cookie', cookie)
        })
      }

      return response
    },

  }
}

/**
 * Validates the session according to current business rules.
 */
export async function validate(ctx: Context, session: IronSession<SessionData>) {
  const now = Math.floor(Date.now() / 1000)
  const invalidationKeyChanged = env.SESSION_INVALIDATION_KEY
    && session?.invalidationKey !== env.SESSION_INVALIDATION_KEY
  const sessionExpired = env.SESSION_TTL && session.expiresAt && now > session.expiresAt
  const ipAddressChanged = session?.ipAddress && session.ipAddress !== getClientIp(ctx)

  if (
    !session.createdAt
    || invalidationKeyChanged
    || sessionExpired
    || ipAddressChanged
  ) {
    const message = ipAddressChanged ? 'IP address changed' : 'Unauthorized'
    session.destroy()

    return {
      valid: false,
      unauthorizedResponse: ctx.json({ error: message ?? 'Unauthorized' }, 401),
    }
  }

  // Extend the expiry by adding the TTL each time this route is visited
  if (env.SESSION_TTL) {
    session.expiresAt = now + env.SESSION_TTL
    await session.save()
  }

  return { valid: true }
}
