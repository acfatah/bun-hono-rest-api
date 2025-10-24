import type { Context, Hono } from 'hono'
import { sql } from 'drizzle-orm'
import type { UserSelect } from '@/db/schema'
import { env } from '@/config/env'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { loadSession } from '@/modules/session/session.service'
import { getRandomCuid, getRandomReadableString } from '@/utils'

const LOGIN_ENDPOINT = '/api/auth/login'

export async function createUser(): Promise<UserSelect> {
  const user = await db
    .insert(schema.user)
    .values({
      id: getRandomCuid(),
      username: `user_${getRandomReadableString()}`,
      name: `Test User ${getRandomReadableString()}`,
      password: getRandomReadableString(),
    } as typeof schema.user.$inferInsert)
    .returning()
    .get()

  return user
}

export async function loginUser(app: Hono, user: { username: string, password: string }) {
  return await app.request(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: user.username, password: user.password }),
  })
}

export async function authenticateUser() {
  const user = await createUser()

  // Build a session using a dummy request (tests bypass actual HTTP handling)
  const dummy = new Request(env.BASE_URL)
  const mockCtx = { req: { raw: dummy } } as unknown as Context
  const { session, setCookie } = await loadSession(mockCtx)

  // Persist the user into the session so middleware can expose it
  session.user = user as Omit<UserSelect, 'password'>
  await session.save()

  // Convert set-cookie response header into Cookie request header format
  session.user = user as Omit<UserSelect, 'password'>
  await session.save()

  return {
    user,
    setCookie,
  }
}

export async function seedDatabase() {
  // Insert test fixtures data
}

export async function resetDatabase() {
  const tables = await db.all(sql`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    AND name NOT LIKE '__drizzle%'
    AND name NOT LIKE 'sqlite_%';
  `).reduce((acc: string[], row: any) => {
    acc.push(row.name)

    return acc
  }, [])

  let qs = ''
  tables.forEach((table: string) => {
    qs += `DELETE FROM ${table};\n`
  })

  if (!qs.trim())
    return

  return await db.run(qs)
}
