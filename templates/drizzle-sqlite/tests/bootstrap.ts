/**
 * This file is used to bootstrap the test environment.
 */

import { and, eq } from 'drizzle-orm'
import process from 'node:process'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'

process.env.NODE_ENV = 'test'

/**
 * Ensures a test user exists in the database for use during tests.
 *
 * This asynchronous helper checks whether a user with the username
 * "testuser" and password "testpassword" already exists. If no such user is
 * found, it inserts a new user record with those credentials. The operation
 * is idempotent: calling it multiple times will not create duplicate users.
 *
 * Side effects:
 * - May insert a new user record into the database when missing.
 * - Logs any errors to the console; errors are caught and not re-thrown.
 *
 * Notes:
 * - Relies on external `db` and `userSchema` bindings from the surrounding scope.
 *
 * @async
 * @returns Promise<void> Resolves when the existence check and optional insert complete.
 */
async function ensureTestUser() {
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
(async () => {
  await ensureTestUser()
})()
