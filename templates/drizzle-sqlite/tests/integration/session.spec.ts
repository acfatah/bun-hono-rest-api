import { describe, expect, it } from 'bun:test'
import '../bootstrap'

import { createApp } from '@/'
import { session } from '@/middleware/session'

describe('session middleware', () => {
  const app = createApp()

  app.get('/protected', session(), (ctx) => {
    // iron-session instance attached in middleware as ctx.req.session
    // @ts-expect-error augmented
    const iron = ctx.req.session
    const user = iron?.session?.user
    if (!user) {
      return ctx.json({ error: 'Unauthorized' }, 401)
    }

    return ctx.json({ message: 'You have accessed a protected route' })
  })

  describe('the GET /protected', () => {
    it('should return a 401 status and a JSON response when no session is provided', async () => {
      const res = await app.request('/protected')

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({
        error: 'Unauthorized',
      })
    })
  })

  describe('the POST /login', () => {
    it('should return a 200 status and a JSON response when valid credentials are provided', async () => {
      const res = await app.request('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpassword',
        }),
      })

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        message: 'Login successful',
      })
    })
  })

  describe('the GET /protected with session', () => {
    it('should return a 200 status and a JSON response when a valid session is provided', async () => {
      const loginRes = await app.request('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpassword',
        }),
      })

      expect(loginRes.status).toBe(200)
      const cookies = loginRes.headers.get('Set-Cookie')
      expect(cookies).toBeDefined()

      // Now, access the protected route with the session cookie
      const res = await app.request('/protected', {
        headers: {
          Cookie: cookies!,
        },
      })

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        message: 'You have accessed a protected route',
      })
    })
  })
})
