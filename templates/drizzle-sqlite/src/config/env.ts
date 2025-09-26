import process from 'node:process'
import { z } from 'zod'

const DEFAULT_NODE_ENV = 'development'
const DEFAULT_PORT = 3000
const DEFAULT_LOG_LEVEL = 'info'
const DEFAULT_PRODUCTION_LOG_FILE = 'production.log'
const DEFAULT_TEST_LOG_FILE = 'test.log'
const DEFAULT_SESSION_COOKIE_NAME = '__s'
const DEFAULT_SESSION_TTL = 60 * 60 * 24 * 7 // 7 days in seconds

// Helper: treat empty strings as undefined so that Zod .default() values apply
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)

const EnvSchema = z.object({
  LOG_LEVEL: z.preprocess(
    (v) => {
      if (typeof v !== 'string')
        return v

      const t = v.trim()

      if (t === '')
        return undefined

      return t.toLowerCase()
    },
    z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .optional()
      .default(DEFAULT_LOG_LEVEL),
  ),

  NODE_ENV: z.enum(['development', 'test', 'production']).default(DEFAULT_NODE_ENV),
  PORT: z.preprocess(emptyToUndefined, z.coerce.number().default(DEFAULT_PORT)),

  APP_SECRET: z.string().min(32),
  BASE_URL: z.url(),
  SESSION_COOKIE_NAME: z.preprocess(emptyToUndefined, z.string().default(DEFAULT_SESSION_COOKIE_NAME)),
  SESSION_TTL: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().default(DEFAULT_SESSION_TTL),
  ),

  // Optional key to invalidate all existing sessions when changed
  SESSION_INVALIDATION_KEY: z.string().optional(),

  TRUSTED_ORIGINS: z.preprocess(
    (v) => {
      if (typeof v !== 'string')
        return v

      return v.split(',').map(s => s.trim()).filter(Boolean)
    },
    z.array(z.url()).default([]),
  ),

  PRODUCTION_LOG_FILE: z.preprocess(
    emptyToUndefined,
    z.string().default(DEFAULT_PRODUCTION_LOG_FILE),
  ),

  TEST_LOG_FILE: z.preprocess(
    emptyToUndefined,
    z.string().default(DEFAULT_TEST_LOG_FILE),
  ),
})

export type Env = z.infer<typeof EnvSchema>

const parsed = EnvSchema.safeParse(Bun.env)

if (!parsed.success) {
  console.error('Invalid env:')
  console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2))
  process.exit(1)
}

export const env: Env = parsed.data
export default env
