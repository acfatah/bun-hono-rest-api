import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timestamps } from './helpers/timestamps'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  ...timestamps,
})
