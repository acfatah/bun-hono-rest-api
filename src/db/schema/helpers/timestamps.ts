import { sql } from 'drizzle-orm'
import { text } from 'drizzle-orm/sqlite-core'
// import { integer } from 'drizzle-orm/sqlite-core'

// https://orm.drizzle.team/docs/guides/timestamp-default-value#sqlite
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('update_at'),
  deletedAt: text('deleted_at'),

  // Using epoch for timestamps. Needs to be converted to milliseconds
  // (multiply by 1000) in frontend application code.
  // createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  // updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  // deletedAt: integer('deleted_at'),
}
