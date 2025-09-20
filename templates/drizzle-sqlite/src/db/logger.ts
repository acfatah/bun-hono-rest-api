import type { LogWriter } from 'drizzle-orm/logger'
import { DefaultLogger } from 'drizzle-orm/logger'
import { env } from '@/config/env'
import { logger as libLogger } from '@/lib/logger'

const DEVELOPMENT_ENVIRONMENT = !env.NODE_ENV || env.NODE_ENV === 'development'

class CustomLogWriter implements LogWriter {
  write(message: string) {
    if (['debug', 'trace'].includes(env.LOG_LEVEL)) {
      // Fallback to default console log for development
      if (DEVELOPMENT_ENVIRONMENT)
        console.debug(message)
      else
        libLogger.debug({ drizzle: message }, 'Drizzle ORM Log')
    }
  }
}

/**
 * Display Drizzle ORM logs in the console based on the LOG_LEVEL environment variable.
 */
export const logger = new DefaultLogger({ writer: new CustomLogWriter() })
