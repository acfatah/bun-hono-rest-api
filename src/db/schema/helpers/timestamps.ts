import { sql } from 'drizzle-orm'
import { text } from 'drizzle-orm/sqlite-core'

// https://orm.drizzle.team/docs/guides/timestamp-default-value#sqlite
export const timestamps = {
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('update_at'),
  deletedAt: text('deleted_at'),
}
