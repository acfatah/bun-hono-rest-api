import type { DebugLogOptions } from 'hono-pino/debug-log'
import process from 'node:process'
import { pino } from 'pino'

const options: DebugLogOptions = {
  colorEnabled: true,
}

const logLevelOrSilent = process.env.LOG_LEVEL || 'silent'
let defaultOptions

if (process.env.NODE_ENV === 'production') {
  defaultOptions = {
    level: logLevelOrSilent,
    ...(logLevelOrSilent !== 'silent' && {
      base: null,
      transport: {
        target: 'pino/file',
        options: {
          append: false,
          destination: 'production.log',
        },
      },
    }),
  }
}
else if (process.env.NODE_ENV === 'test') {
  defaultOptions = {
    level: logLevelOrSilent,
    ...(logLevelOrSilent !== 'silent' && {
      base: null,
      transport: {
        target: 'pino/file',
        options: {
          append: false,
          destination: 'test.log',
        },
      },
    }),
  }
}
else {
  // development
  defaultOptions = {
    base: null,
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      // To have more lightweight logs, use the 'hono-pino/debug-log' target
      // for transport.
      target: 'pino-pretty',
      options,
    },
  }
}

export const logger = pino(defaultOptions)
