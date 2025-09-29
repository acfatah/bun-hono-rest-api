import process from 'node:process'
import { z } from 'zod'

const DEFAULT_NODE_ENV = 'development'
const DEFAULT_PORT = 3000
const DEFAULT_LOG_LEVEL = 'info'
const DEFAULT_PRODUCTION_LOG_FILE = 'production.log'
const DEFAULT_TEST_LOG_FILE = 'test.log'
const DEFAULT_SQLITE_DB_PATH = ':memory:'
const DEFAULT_SMTP_PORT = 587

// Helper: treat empty strings as undefined so that Zod .default() values apply
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)

// Helper: convert string boolean values to actual booleans
function stringToBoolean(v: unknown) {
  if (typeof v !== 'string')
    return v

  const val = v.trim().toLowerCase()
  if (val === 'true' || val === '1')
    return true
  if (val === 'false' || val === '0' || val === '')
    return false

  return v
}

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
  BASE_URL: z.url(),

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

  SQLITE_DB_PATH: z.preprocess(
    emptyToUndefined,
    z.string().default(DEFAULT_SQLITE_DB_PATH),
  ),

  AUTH_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),

  BETTER_AUTH_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),

  ENABLE_SMTP_MAILER: z.preprocess(
    stringToBoolean,
    z.boolean().default(false),
  ),

  // SMTP settings (optional when ENABLE_SMTP_MAILER=false)
  SMTP_HOST: z.string().min(1, 'SMTP_HOST required').optional(),
  SMTP_PORT: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(DEFAULT_SMTP_PORT),
  ).optional(),
  SMTP_SECURE: z.preprocess(
    stringToBoolean,
    z.boolean().default(false),
  ).optional(),
  SMTP_USER: z.string().min(1, 'SMTP_USER required').optional(),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS required').optional(),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email').optional(),
}).superRefine((input, ctx) => {
  // Either AUTH_SECRET or BETTER_AUTH_SECRET must be provided (non-empty)
  if (!input.AUTH_SECRET && !input.BETTER_AUTH_SECRET) {
    const message = 'Either AUTH_SECRET or BETTER_AUTH_SECRET must be set'

    ctx.addIssue({
      code: 'custom',
      path: ['AUTH_SECRET'],
      message,
    })

    ctx.addIssue({
      code: 'custom',
      path: ['BETTER_AUTH_SECRET'],
      message,
    })
  }

  // SMTP settings validation
  if (input.ENABLE_SMTP_MAILER) {
    const missing: string[] = []
    if (!input.SMTP_HOST)
      missing.push('SMTP_HOST')

    if (!input.SMTP_USER)
      missing.push('SMTP_USER')

    if (!input.SMTP_PASS)
      missing.push('SMTP_PASS')

    if (!input.SMTP_FROM)
      missing.push('SMTP_FROM')

    // SMTP_PORT & SMTP_SECURE have defaults; host/user/pass/from must exist when enabled
    if (missing.length) {
      ctx.addIssue({
        code: 'custom',
        message: `Missing required SMTP vars: ${missing.join(', ')}`,
        path: ['ENABLE_SMTP_MAILER'],
      })
    }
  }
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
