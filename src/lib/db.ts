/**
 * Use Drizzle ORM with Bun
 * @see https://bun.sh/guides/ecosystem/drizzle
 * @see https://bun.sh/docs/api/sqlite
 */

import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import process from 'node:process'

const filename = process.env.SQLITE_DB_PATH || ':memory:'

if (!process.env.SQLITE_DB_PATH) {
  console.warn('SQLITE_DB_PATH environment variable is not set. Using memory storage.')
}

const sqlite = new Database(filename)

export const db = drizzle(sqlite, { logger: true })
