import pino from 'pino'
import { env } from '@/config/env'

const PRODUCTION_ENVIRONMENT = env.NODE_ENV === 'production'
const TEST_ENVIRONMENT = env.NODE_ENV === 'test'

export const logger = pino({
  base: null,
  level: env.LOG_LEVEL,
  transport: {
    target: PRODUCTION_ENVIRONMENT || TEST_ENVIRONMENT ? 'pino/file' : 'pino-pretty',
    options: {
      ...(PRODUCTION_ENVIRONMENT)
        ? { append: true, destination: 'production.log' }
        : (TEST_ENVIRONMENT)
            ? { append: false, destination: 'test.log' }
            : { colorEnabled: true }, // development
    },
  },
})
