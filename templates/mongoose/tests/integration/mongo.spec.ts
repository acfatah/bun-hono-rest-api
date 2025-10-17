import { describe, expect, it } from 'bun:test'
import { connect, getDB } from '@/db'
import '../bootstrap'

describe('mongo', () => {
  it('should connect and return a Db instance', async () => {
    const db = await connect()
    expect(db).toBeDefined()
    expect(typeof db.collection).toBe('function')
  })

  it('getDB should return the same Db instance', async () => {
    const db1 = await connect()
    const db2 = await getDB()
    expect(db2).toBe(db1)
  })

  it('should be able to list collections', async () => {
    const db = await getDB()
    const collections = await db.listCollections().toArray()
    expect(Array.isArray(collections)).toBe(true)
  })
})
