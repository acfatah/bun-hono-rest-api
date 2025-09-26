import type { IronSession } from 'iron-session'
import type { StandardJwtClaims } from '@/modules/jwt/jwt.service'
import type { SessionData } from './index'

declare module 'hono' {
  interface ContextVariableMap {
    session: IronSession<SessionData>
    jwtClaims?: StandardJwtClaims
  }

  interface HonoRequest {
    session?: IronSession<SessionData>
  }
}
