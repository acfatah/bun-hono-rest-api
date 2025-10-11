import { defineConfig } from 'drizzle-kit'
import process from 'node:process'
import { styleText } from 'node:util'

const DEFAULT_PRODUCTION_DB_PATH = './production.sqlite3'
const DEFAULT_DEVELOPMENT_DB_PATH = './development.sqlite3'
const SCHEMA_PATH = './src/db/schema.ts'
const bText = (text: string) => styleText(['blueBright'], text)

export function resolveSqlitePath() {
  if (['production', 'staging'].includes(process.env.NODE_ENV || '')) {
    return process.env.SQLITE_DB_PATH || DEFAULT_PRODUCTION_DB_PATH
  }
  else if (process.env.NODE_ENV === 'development') {
    return DEFAULT_DEVELOPMENT_DB_PATH
  }
  else {
    // test
    return ':memory:'
  }
}

const url = resolveSqlitePath()
console.log(`Using SQLite database at: ${bText(url)}`)

export default defineConfig({
  dialect: 'sqlite',
  schema: SCHEMA_PATH,
  out: './drizzle',
  dbCredentials: {
    url,
  },
})
