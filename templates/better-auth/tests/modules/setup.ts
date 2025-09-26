import { eq } from 'drizzle-orm'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { auth } from '@/modules/auth/auth.service'

export async function signUpUser({
  email = 'user@example.com',
  password = 'P@55w0rd',
  // name = 'user',
  asResponse = false, // optionally returns a response object instead of data
} = {}) {
  return await auth.api.signUpEmail({
    // @ts-expect-error removed name from schema
    body: {
      email,
      password,
      // name,
    },
    asResponse,
  })
}

export async function signInUser({
  email = 'user@example.com',
  password = 'P@55w0rd',
  asResponse = false, // optionally returns a response object instead of data
} = {}) {
  return await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse,
  })
}

export async function getSession(token: string) {
  return await db
    .select()
    .from(schema.session)
    .where(eq(schema.session.token, token))
    .limit(1)
    .get()
}

export async function seedDatabase() {
  // Insert test fixtures data
}

export async function resetDatabase() {
  // Truncate all relevant tables
}
