/**
 * Use Drizzle ORM with Bun
 * @see https://bun.sh/guides/ecosystem/drizzle
 * @see https://bun.sh/docs/api/sqlite
 */

import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import process from 'node:process'
import { logger } from '@/db/logger'
import * as schema from '@/db/schema'

let filename = ':memory:'

if (process.env.NODE_ENV === 'production') {
  filename = process.env.SQLITE_DB_PATH || 'data.sqlite3'
}
else if (process.env.NODE_ENV === 'test') {
  filename = ':memory:'
}
else {
  // development
  filename = 'data-dev.sqlite3'
}

const client = new Database(filename)

export const db = drizzle<typeof schema>({
  client,
  schema,
  logger,
  casing: 'snake_case',
})
