import { describe, expect, it } from 'bun:test'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import '../bootstrap'

describe('sqlite db', () => {
  it('should be defined', () => {
    expect(db).toBeDefined()
  })

  it('should connect successfully to the database', async () => {
    let isConnected = false
    let result: number | undefined

    try {
      // Attempt to perform a simple query
      const query = sql`SELECT 1+1`
      ;[result] = await db.get(query) as Array<number>
      isConnected = result !== undefined
    }
    catch (error) {
      isConnected = false
      console.error(error)
    }

    expect(isConnected).toBe(true)
    expect(result).toBe(2)
  })
})
