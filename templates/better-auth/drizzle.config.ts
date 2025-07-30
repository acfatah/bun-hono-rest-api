import { defineConfig } from 'drizzle-kit'
import process from 'node:process'

let url: string

if (process.env.NODE_ENV === 'production') {
  url = process.env.SQLITE_DB_PATH || 'data.sqlite3'
}
else if (process.env.NODE_ENV === 'test') {
  url = ':memory:'
}
else {
  // development
  url = 'data-dev.sqlite3'
}

export default defineConfig({
  dialect: 'sqlite',
  out: './drizzle',
  schema: './src/db/schema',
  dbCredentials: {
    url,
  },
})
