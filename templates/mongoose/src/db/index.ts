import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'
import process from 'node:process'
import { styleText } from 'node:util'
import { env } from '../config/env.js'

const bText = (text: string) => styleText(['blueBright'], text)
let client: MongoClient | null
let db: Db | null

export async function connect(): Promise<Db> {
  try {
    if (db)
      return db

    if (!client)
      client = new MongoClient(env.MONGODB_URI)

    await client.connect()
    db = client.db(env.MONGODB_DB)
    // console.log('Connected to MongoDB')
    console.log(`Connected to MongoDB: ${bText(env.MONGODB_DB)} at ${bText(env.MONGODB_URI)}`)

    return db
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

export function getDB(): Promise<Db> {
  if (db)
    return Promise.resolve(db)

  return connect()
}
