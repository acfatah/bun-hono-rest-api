import type { User } from '@/db/schema'

export interface SessionData {
  session: {
    user: User | null

    createdAt: number
    expiresAt: number
    invalidationKey?: string
  } | null
}
