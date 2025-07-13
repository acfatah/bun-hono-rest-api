import { describe, expect, it } from 'bun:test'
import '../bootstrap'
import { signInUser, signUpUser } from './setup'

import { eq } from 'drizzle-orm'
import * as schema from '@/db/schema'
import app from '@/index'
import { db } from '@/lib/sqlite'

describe('protected route', async () => {
  const email = 'test@example.com'

  describe('when no user is signed in', () => {
    it('should return a 401 status', async () => {
      const response = await app.request('/protected')

      expect(response.status).toBe(401)
    })
  })

  describe('when a user is signed up', async () => {
    it('should exist in the database', async () => {
      const result = await signUpUser({
        email,
      })

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('test@example.com')
    })
  })

  describe('when a user is signed in', async () => {
    it('should return a 401 status when not verified', async () => {
      const result = await signInUser({
        email,
      })
      expect(result.user).toBeDefined()

      const response = await app.request('/protected')
      expect(response.status).toBe(401)
    })

    it('should return a 200 status when verified', async () => {
      // Manually verify user registration
      await db
        .update(schema.user)
        .set({ emailVerified: true })
        .where(eq(schema.user.email, email))

      const signInResponse = await signInUser({
        email,
        asResponse: true,
      })

      // @ts-expect-error response object has headers
      const cookieHeader = signInResponse.headers.get('set-cookie')
      expect(cookieHeader).toBeDefined()

      const response = await app.request('/protected', {
        headers: {
          cookie: cookieHeader,
        },
      })
      expect(response.status).toBe(200)
    })
  })
})
