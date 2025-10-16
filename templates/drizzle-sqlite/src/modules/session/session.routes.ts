import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/types'
import env from '@/config/env'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'

export const sessionRoutes = new Hono()

sessionRoutes.post('/login', async (ctx) => {
  // Use the underlying Fetch API Request (ctx.req.raw) and a temporary Response to allow iron-session
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

  const { username, password } = await ctx.req.json()
  const user = await db.query.user.findFirst({
    where: eq(userSchema.username, username),
  })

  // TODO: Implement proper password hashing!
  const valid = user && user.password === password

  if (!valid) {
    const unauthorized = ctx.json({ message: 'Invalid credentials' }, 401)
    // Forward any Set-Cookie headers (e.g. for cleared session) if present
    const setCookie = tempRes.headers.get('set-cookie')
    if (setCookie)
      unauthorized.headers.set('Set-Cookie', setCookie)

    return unauthorized
  }

  const { password: _, ...userWithoutPassword } = user!
  const now = Math.floor(Date.now() / 1000)
  session.user = userWithoutPassword

  if (!session.createdAt)
    session.createdAt = now

  if (!session.expiresAt)
    session.expiresAt = now + env.SESSION_TTL

  if (env.SESSION_INVALIDATION_KEY)
    session.invalidationKey = env.SESSION_INVALIDATION_KEY

  await session.save()

  const response = ctx.json({
    message: 'Login successful',
    data: { user: userWithoutPassword },
  })

  const setCookie = tempRes.headers.get('set-cookie')
  if (setCookie)
    response.headers.set('Set-Cookie', setCookie)

  return response
})

sessionRoutes.get('/session', async (ctx) => {
  const now = Math.floor(Date.now() / 1000)
  const tempRes = new Response()
  const session = await getIronSession<SessionData>(
    ctx.req.raw,
    tempRes,
    {
      password: env.APP_SECRET,
      cookieName: env.SESSION_COOKIE_NAME,
    },
  )

  if (
    !session
    || !session.user
    || (env.SESSION_INVALIDATION_KEY && session.invalidationKey !== env.SESSION_INVALIDATION_KEY)
    || (env.SESSION_TTL && now > session.expiresAt)
  ) {
    const unauthorized = ctx.json({ message: 'No active session' }, 401)
    // We should forward any existing Set-Cookie headers (e.g. for cleared session) if present
    const setCookie = tempRes.headers.get('set-cookie')
    if (setCookie)
      unauthorized.headers.set('Set-Cookie', setCookie)

    return unauthorized
  }

  // Extend the expiry by adding the TTL each time this route is visited
  if (env.SESSION_TTL) {
    session.expiresAt = now + env.SESSION_TTL
    await session.save()
  }

  const response = ctx.json({
    message: 'Session active',
    data: {
      user: session.user,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    },
  })

  const setCookie = tempRes.headers.get('set-cookie')
  if (setCookie)
    response.headers.set('Set-Cookie', setCookie)

  return response
})

sessionRoutes.post('/logout', async (ctx) => {
  const response = new Response(null, { status: 204 })

  const session = await getIronSession<SessionData>(
    ctx.req.raw,
    response,
    {
      password: env.APP_SECRET,
      cookieName: env.SESSION_COOKIE_NAME,
    },
  )

  if (session) {
    session.destroy()
  }

  return response
})
