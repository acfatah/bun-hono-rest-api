import type { MiddlewareHandler } from 'hono'
import type { PinoLogger } from 'hono-pino'
import { logger as libLogger } from '@/lib/logger'

export function logger() {
  return libLogger as unknown as MiddlewareHandler<{ Variables: { logger: PinoLogger } }>
}
