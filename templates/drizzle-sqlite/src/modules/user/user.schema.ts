import { cuid2 } from 'drizzle-cuid2/sqlite'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timestamps } from '@/db/schema/helpers'

export const user = sqliteTable('users', {
  id: cuid2('id').defaultRandom().primaryKey(),
  username: text().notNull().unique(),
  password: text().notNull(),
  ...timestamps,
})

export type UserRecord = typeof user.$inferSelect
export type UserCreate = typeof user.$inferInsert

export type UserUpdate = Pick<UserRecord, 'id'>
  & Partial<
    Omit<
      UserCreate,
      | 'id'
      | ('createdAt' extends keyof UserCreate ? 'createdAt' : never)
      | ('updatedAt' extends keyof UserCreate ? 'updatedAt' : never)
    >
  >

export type UserDelete = Pick<UserRecord, 'id'>
