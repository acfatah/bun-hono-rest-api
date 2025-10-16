/**
 * This file is used to bootstrap the test environment.
 */

import { and, eq } from 'drizzle-orm'
import process from 'node:process'
import { db } from '@/db'
import { migrate } from '@/db/migrator'
import { user as userSchema } from '@/db/schema'

// Provide required env vars for the configuration schema to run tests in isolation
process.env.NODE_ENV = 'test'
process.env.APP_SECRET ||= 'testsecret_testsecret_testsecret_123456'
process.env.BASE_URL ||= 'http://localhost:3000'
process.env.SESSION_COOKIE_NAME ||= '__test_s'

async function ensureTestUserExists() {
  try {
    const existing = await db.query.user.findFirst({
      where: and(
        eq(userSchema.username, 'testuser'),
        eq(userSchema.password, 'testpassword'),
      ),
    })

    if (!existing) {
      db.insert(userSchema).values({
        username: 'testuser',
        password: 'testpassword',
      }).run()
    }
  }
  catch (e) {
    console.error('Failed to seed test user', e)
  }
}

void (async () => {
  migrate()
  await ensureTestUserExists()
})()
