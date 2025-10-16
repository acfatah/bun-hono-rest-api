import type { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import type { UserSelect } from '@/db/schema'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { build as buildSession } from '@/modules/session/session.service'
import { getRandomCuid, getRandomReadableString } from './utils'

export async function createUser(): Promise<typeof schema.user.$inferSelect> {
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
  return await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: user.username, password: user.password }),
  })
}

export async function authenticateUser() {
  const user = await createUser()

  // Build a session using a dummy request (tests bypass actual HTTP handling)
  const dummy = new Request('http://localhost/')
  const iron = await buildSession(dummy)

  // Persist the user into the session so middleware can expose it
  iron.session.user = user as UserSelect
  await iron.session.save()
  const setCookie = iron.response.headers.get('Set-Cookie')
  // Convert Set-Cookie response header into Cookie request header format
  let cookieHeader: string | undefined
  if (setCookie) {
    // If multiple cookies are ever set, join just the name=value pairs
    cookieHeader = setCookie
      .split(/,(?=[^;]+?=)/) // split on commas that delimit cookies
      .map((c: string) => c.split(';')[0])
      .join('; ')
  }

  return {
    user,
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
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
