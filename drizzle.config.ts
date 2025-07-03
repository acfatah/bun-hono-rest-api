import { defineConfig } from 'drizzle-kit'
import process from 'node:process'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH!,
  },
})
