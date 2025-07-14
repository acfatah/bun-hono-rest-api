import { integer } from 'drizzle-orm/sqlite-core'

// https://orm.drizzle.team/docs/guides/timestamp-default-value#sqlite
export const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  deletedAt: integer('deleted_at'),
}
