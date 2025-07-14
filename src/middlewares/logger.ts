import { pinoLogger } from 'hono-pino'
import { logger as pino } from '@/lib/logger'

export function logger() {
  return pinoLogger({
    pino,
  })
}
