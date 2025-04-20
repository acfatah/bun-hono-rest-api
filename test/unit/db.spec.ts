import { db } from '@/lib/db'
import { describe, expect, it } from 'bun:test'

describe('drizzle', () => {
  it('should connect successfully', async () => {
    const result = await db.run('select 1')

    expect(result).toBeTruthy()
  })
})
