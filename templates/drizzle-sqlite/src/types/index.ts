import type { UserRecord } from '@/db/schema'

export interface SessionData {
  user: Omit<UserRecord, 'password'> | null

  ipAddress: string | null
  createdAt: number
  expiresAt: number
  invalidationKey?: string
}
