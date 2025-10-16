import type { SQL } from 'drizzle-orm/sql'
import cuid2 from '@paralleldrive/cuid2'
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core'

export function getRandomCuid() {
  return cuid2.createId()
}

/** Method to inspect a query */
export function queryToString(query: SQL<unknown>) {
  const sqliteDialect = new SQLiteSyncDialect()

  return sqliteDialect
    .sqlToQuery(query)
    .sql
    .split(';')
    .join('\n')
}

export function getRandomReadableString(length: number = 6): string {
  const consonants = 'bcdfghjklmnpqrstvwxyz'
  const vowels = 'aeiou'
  let result = ''

  const getRandomChar = (chars: string) => chars.charAt(Math.floor(Math.random() * chars.length))

  for (let i = 0; i < length; i++) {
    // Alternate between consonants and vowels for readability
    result += i % 2 === 0 ? getRandomChar(consonants) : getRandomChar(vowels)
  }

  return result
}
