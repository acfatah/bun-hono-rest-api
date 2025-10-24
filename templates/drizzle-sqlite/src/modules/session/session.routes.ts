import type { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'
import { createSession, loadSession, validate } from './session.service'

export const sessionRoutes = new Hono()

sessionRoutes.post('/login', async (ctx: Context) => {
  const { session, setCookie } = await createSession(ctx)
  const { username, password } = await ctx.req.json()
  const user = await db.query.user.findFirst({
    where: eq(userSchema.username, username),
  })

  // TODO: Implement proper password hashing!
  const valid = user && user.password === password

  if (!valid) {
    const unauthorized = ctx.json({ message: 'Invalid credentials' }, 401)
    setCookie(unauthorized)

    return unauthorized
  }

  const { password: _, ...userWithoutPassword } = user!
  session.user = userWithoutPassword
  await session.save()

  const response = ctx.json({
    message: 'Login successful',
    data: { user: userWithoutPassword },
  })
  setCookie(response)

  return response
})

sessionRoutes.get('/session', async (ctx: Context) => {
  const { session, setCookie } = await loadSession(ctx)
  const { valid, unauthorizedResponse } = await validate(ctx, session)

  if (!valid)
    return unauthorizedResponse

  const response = ctx.json({
    message: 'Session active',
    data: {
      user: session.user,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    },
  })
  setCookie(response)

  return response
})

sessionRoutes.post('/logout', async (ctx: Context) => {
  const response = new Response(null, { status: 204 })
  const { session, setCookie } = await loadSession(ctx)
  session.destroy()
  setCookie(response)

  return response
})
