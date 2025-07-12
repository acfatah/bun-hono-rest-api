import type { DebugLogOptions } from 'hono-pino/debug-log'
import process from 'node:process'
import { pino } from 'pino'

const options: DebugLogOptions = {
  colorEnabled: true,
}

const transport = {
  target: 'hono-pino/debug-log',
  options,
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
      transport,
    }),
  }
}
else {
  // development
  defaultOptions = {
    level: process.env.LOG_LEVEL || 'info',
    base: null,
    transport,
  }
}

export const logger = pino(defaultOptions)
