import { cuid2 } from 'drizzle-cuid2/sqlite'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timestamps } from '@/db/schema/helpers'

export const user = sqliteTable('users', {
  id: cuid2('id').defaultRandom().primaryKey(),
  username: text().notNull().unique(),
  password: text().notNull(),
  ...timestamps,
})

export type User = typeof user.$inferSelect
