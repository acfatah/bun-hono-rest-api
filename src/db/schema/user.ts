import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timestamps } from './helpers/timestamps'

export const user = sqliteTable('users', {
  // Optionally use cuid2
  // id: cuid2('id').defaultRandom().primaryKey(),
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  ...timestamps,
})
