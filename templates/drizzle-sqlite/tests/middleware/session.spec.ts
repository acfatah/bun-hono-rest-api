import type { Context } from 'hono'
import { describe, expect, it } from 'bun:test'
import type { SessionData } from '@/types'
import '../bootstrap'
import { session } from '@/modules/session/session.middleware'
import { authenticateUser } from '../setup'

const LOGIN_ENDPOINT = '/api/auth/login'
const SESSION_ENDPOINT = '/api/auth/session'

// Dynamically import createApp AFTER env vars are set to avoid early validation failure
const { createApp } = await import('@/app')
const app = createApp()

describe('session middleware', () => {
  app.get('/protected', session(), (ctx: Context) => {
    const session = ctx.get('session') as SessionData | undefined
    const user = session?.user
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

  describe('the POST /api/auth/login', () => {
    it('should return a 200 status and a JSON response when valid credentials are provided', async () => {
      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const res = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })

      expect(res.status).toBe(200)
    })
  })

  describe('the GET /protected with session', () => {
    it('should return a 200 status and a JSON response when a valid session is provided', async () => {
      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const loginRes = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })

      expect(loginRes.status).toBe(200)
      const cookies = loginRes.headers.get('set-cookie')
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

  describe('the POST /api/auth/logout', () => {
    // Despite the cookie is deleted on the client side, the cookie is still valid
    // until it expires.
    it.skip('should return a 204 status and no content when logging out', async () => {
      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const loginRes = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })
      expect(loginRes.status).toBe(200)
      const cookies = loginRes.headers.get('set-cookie')
      expect(cookies).toBeDefined()

      const logoutRes = await app.request('/auth/logout', {
        method: 'POST',
        headers: { Cookie: cookies! },
      })
      expect(logoutRes.status).toBe(204)
      expect(await logoutRes.text()).toBe('')

      // Ensure the session was invalidated: accessing protected route with same cookie should be unauthorized
      const protectedRes = await app.request('/protected', {
        headers: { Cookie: cookies! },
      })
      expect(protectedRes.status).toBe(401)
      expect(await protectedRes.json()).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('session invalidation key behavior', () => {
    it('should invalidate (401) when SESSION_INVALIDATION_KEY changes after login', async () => {
      // Ensure a key is present before login
      // Importing here to avoid potential hoisting issues; using dynamic import pattern
      const { env } = await import('@/config/env')

      env.SESSION_INVALIDATION_KEY = 'initial-key'

      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const loginRes = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })
      expect(loginRes.status).toBe(200)
      const cookie = loginRes.headers.get('set-cookie')
      expect(cookie).toBeTruthy()

      // Change the invalidation key to force mismatch with stored session
      env.SESSION_INVALIDATION_KEY = 'rotated-key'

      const protectedRes = await app.request('/protected', {
        headers: {
          Cookie: cookie!,
        },
      })

      expect(protectedRes.status).toBe(401)
      expect(await protectedRes.json()).toEqual({ error: 'Unauthorized' })
    })

    it('should continue to allow session when invalidation key is unset (no mismatch logic)', async () => {
      const { env } = await import('@/config/env')

      // Remove invalidation key entirely
      delete env.SESSION_INVALIDATION_KEY

      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const loginRes = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })
      expect(loginRes.status).toBe(200)
      const cookie = loginRes.headers.get('set-cookie')
      expect(cookie).toBeTruthy()

      const protectedRes = await app.request('/protected', {
        headers: { Cookie: cookie! },
      })
      expect(protectedRes.status).toBe(200)
      expect(await protectedRes.json()).toEqual({ message: 'You have accessed a protected route' })
    })
  })

  describe('ip address guard on /api/auth/session', () => {
    it('should allow session when Cloudflare cf-connecting-ip matches the one used at login', async () => {
      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const loginRes = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-connecting-ip': '1.1.1.1',
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })

      expect(loginRes.status).toBe(200)
      const cookie = loginRes.headers.get('set-cookie')
      expect(cookie).toBeTruthy()

      const sessionRes = await app.request(SESSION_ENDPOINT, {
        headers: {
          'Cookie': cookie!,
          'cf-connecting-ip': '1.1.1.1',
        },
      })

      expect(sessionRes.status).toBe(200)
      const json = await sessionRes.json() as { message: string, data: { ipAddress: string } }
      expect(json?.message).toBe('Session active')
      expect(json?.data?.ipAddress).toBe('1.1.1.1')
    })

    it('should reject session when Cloudflare cf-connecting-ip differs from login ip', async () => {
      const { user } = await authenticateUser()
      expect(user).toBeDefined()

      const loginRes = await app.request(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-connecting-ip': '1.1.1.1',
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      })

      expect(loginRes.status).toBe(200)
      const cookie = loginRes.headers.get('set-cookie')
      expect(cookie).toBeTruthy()

      const sessionRes = await app.request(SESSION_ENDPOINT, {
        headers: {
          'Cookie': cookie!,
          'cf-connecting-ip': '2.2.2.2',
        },
      })

      expect(sessionRes.status).toBe(401)
      expect(await sessionRes.json()).toEqual({ error: 'IP address changed' })
    })
  })
})
