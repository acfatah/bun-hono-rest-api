import type { Session, User } from '@/db/schema'

declare module 'hono' {
  interface ContextVariableMap {
    user: User | null
    session: Session | null
  }

  interface HonoRequest {
    user: User
    session: Session
  }
}
