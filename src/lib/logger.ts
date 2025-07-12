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
    level: 'silent',
  }
}
else {
  // development
  defaultOptions = {
    base: null,
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'hono-pino/debug-log',
      options,
    },
  }
}

export const logger = pino(defaultOptions)
