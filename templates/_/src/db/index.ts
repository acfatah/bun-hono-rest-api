/**
 * Use Drizzle ORM with Bun
 * @see https://bun.sh/guides/ecosystem/drizzle
 * @see https://bun.sh/docs/api/sqlite
 */

import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { logger } from '@/db/logger'
import * as schema from '@/db/schema'
import { resolveSqlitePath } from '../../drizzle.config'

const filename = resolveSqlitePath()

const client = new Database(filename)

export const db = drizzle<typeof schema>({
  client,
  schema,
  logger,
  casing: 'snake_case',
})
