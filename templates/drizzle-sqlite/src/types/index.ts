import type { UserSelect } from '@/db/schema'

export interface SessionData {
  user: Omit<UserSelect, 'password'> | null

  ipAddress: string | null
  createdAt: number
  expiresAt: number
  invalidationKey?: string
}
