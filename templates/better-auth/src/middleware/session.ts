import { createMiddleware } from 'hono/factory'
import { auth } from '@/modules/auth/auth.provider'

export function session() {
  return createMiddleware(async (ctx, next) => {
    const session = await auth.api.getSession({ headers: ctx.req.raw.headers })

    if (!session) {
      ctx.set('user', null)
      ctx.set('session', null)
      ctx.status(401)

      return ctx.json({ error: 'Unauthorized' })
    }

    ctx.set('user', session.user)
    ctx.set('session', {
      ...session.session,
      ipAddress: session.session.ipAddress ?? null,
      userAgent: session.session.userAgent ?? null,
    })

    return next()
  })
}
