import type { MiddlewareHandler } from 'hono'
import { pinoLogger } from 'hono-pino'
import { logger as pino } from '@/lib/logger'

export function logger(): MiddlewareHandler {
  return pinoLogger({
    pino,
  })
}
