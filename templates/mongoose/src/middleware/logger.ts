import type { MiddlewareHandler } from 'hono'
import type { PinoLogger } from 'hono-pino'
import { pinoLogger } from 'hono-pino'
import { logger as pino } from '@/lib/logger'

export function logger() {
  return pinoLogger({ pino }) as unknown as MiddlewareHandler<{
    Variables: { logger: PinoLogger }
  }>
}
