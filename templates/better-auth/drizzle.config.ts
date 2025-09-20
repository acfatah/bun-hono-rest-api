import { defineConfig } from 'drizzle-kit'
import process from 'node:process'

export function resolveSqlitePath() {
  if (['production', 'staging'].includes(process.env.NODE_ENV || '')) {
    return process.env.SQLITE_DB_PATH || './data.sqlite3'
  }
  else if (process.env.NODE_ENV === 'development') {
    return './data.development.sqlite3'
  }
  else {
    // test
    return ':memory:'
  }
}

const url = resolveSqlitePath()

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url,
  },
})
