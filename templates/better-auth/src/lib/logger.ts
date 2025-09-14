import { pinoLogger } from 'hono-pino'
import process from 'node:process'

const logLevelOrSilent = process.env.LOG_LEVEL || 'silent'
const onProduction = process.env.NODE_ENV === 'production'
const onTest = process.env.NODE_ENV === 'test'

export const logger = pinoLogger({
  pino: {
    base: null,
    level: logLevelOrSilent,
    transport: {
      target: onProduction || onTest ? 'pino/file' : 'pino/pretty',
      options: {
        ...(onProduction)
          ? { append: true, destination: 'production.log' }
          : (onTest)
              ? { append: false, destination: 'test.log' }
              : { colorEnabled: true }, // development
      },
    },
  },
})
