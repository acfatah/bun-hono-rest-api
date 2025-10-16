/* eslint-disable import/first */
// Ensure required env vars exist BEFORE importing any module that loads the validated env
process.env.APP_SECRET ||= 'testsecret_testsecret_testsecret_123456'
process.env.BASE_URL ||= 'http://localhost:3000'
process.env.SESSION_COOKIE_NAME ||= '__test_s'

interface TestEnv {
  APP_SECRET?: string
  BASE_URL?: string
  SESSION_COOKIE_NAME?: string
}

const env = Bun.env as unknown as TestEnv
env.APP_SECRET ??= process.env.APP_SECRET
env.BASE_URL ??= process.env.BASE_URL
env.SESSION_COOKIE_NAME ??= process.env.SESSION_COOKIE_NAME

import type { Context, Hono } from 'hono'
import { describe, expect, it } from 'bun:test'
import '../bootstrap'
import { createApp } from '@/app'
import { session } from '@/modules/session/session.middleware'

const app: Hono = createApp()

describe('session middleware', () => {
  app.get('/protected', session(), (ctx: Context) => {
    // iron-session instance attached in middleware as ctx.req.session
    const session = ctx.req.session
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

  describe('session invalidation key behavior', () => {
    it('should invalidate (401) when SESSION_INVALIDATION_KEY changes after login', async () => {
      // Ensure a key is present before login
      // Importing here to avoid potential hoisting issues; using dynamic import pattern
      const { env } = await import('@/config/env')

      env.SESSION_INVALIDATION_KEY = 'initial-key'

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
      const cookie = loginRes.headers.get('Set-Cookie')
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

      const loginRes = await app.request('/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpassword' }),
      })
      expect(loginRes.status).toBe(200)
      const cookie = loginRes.headers.get('Set-Cookie')
      expect(cookie).toBeTruthy()

      const protectedRes = await app.request('/protected', {
        headers: { Cookie: cookie! },
      })
      expect(protectedRes.status).toBe(200)
      expect(await protectedRes.json()).toEqual({ message: 'You have accessed a protected route' })
    })
  })
})
