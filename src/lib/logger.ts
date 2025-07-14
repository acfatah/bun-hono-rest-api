import type { DebugLogOptions } from 'hono-pino/debug-log'
import process from 'node:process'
import { pino } from 'pino'

const options: DebugLogOptions = {
  colorEnabled: true,
}

let defaultOptions

if (process.env.NODE_ENV === 'production') {
  defaultOptions = {}
}
else if (process.env.NODE_ENV === 'test') {
  defaultOptions = {
    level: process.env.LOG_LEVEL || 'silent',
    ...(process.env.LOG_LEVEL && {
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
    level: process.env.LOG_LEVEL || 'info',
    base: null,
    transport: {
      target: 'hono-pino/debug-log',
      options,
    },
  }
}

export const logger = pino(defaultOptions)
