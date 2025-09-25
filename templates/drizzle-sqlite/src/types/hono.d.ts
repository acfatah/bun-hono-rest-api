import type { IronSession } from 'iron-session'
import type { SessionData } from './index'

declare module 'hono' {
  interface ContextVariableMap {
    session: IronSession<SessionData>
  }

  interface HonoRequest {
    session?: IronSession<SessionData>
  }
}
