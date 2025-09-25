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

  if (!session) {
    Object.assign(session, {
      user,
      createdAt: Date.now(),
      expiresAt: Date.now() + env.SESSION_TTL,
    })
  }
  else {
    session.user = user
  }

  if (env.SESSION_INVALIDATION_KEY)
    session.invalidationKey = env.SESSION_INVALIDATION_KEY

  await session.save()

  const response = ctx.json({ message: 'Login successful' })
  const setCookie = tempRes.headers.get('set-cookie')
  if (setCookie)
    response.headers.set('Set-Cookie', setCookie)

  return response
})
