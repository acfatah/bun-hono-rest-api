import type { User } from '@/db/schema'

export interface SessionData {
  user: User | null

  createdAt: number
  expiresAt: number
  invalidationKey?: string
}
