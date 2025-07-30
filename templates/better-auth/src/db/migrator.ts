import process from 'node:process'

// Drizzle sqlite migrator
import { migrate as drizzleMigrate } from 'drizzle-orm/bun-sqlite/migrator'
import { db } from '@/db'
import drizzleConfig from '../../drizzle.config'

export function migrate() {
  try {
    drizzleMigrate(db, { migrationsFolder: drizzleConfig.out || './drizzle' })
  }
  catch (error) {
    if (error instanceof Error && error.message.match(/Can't find meta\/_journal\.json file/))
      console.warn('Please run `bun db:generate` to initialize the database.')
    else
      console.error(error)

    process.exit(1)
  }
}
