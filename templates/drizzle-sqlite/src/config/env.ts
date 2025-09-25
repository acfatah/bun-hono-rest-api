import process from 'node:process'
import { z } from 'zod'

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
      .default('info'),
  ),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional(),

  APP_SECRET: z.string().min(32),
  BASE_URL: z.url(),
  SESSION_COOKIE_NAME: z.preprocess(emptyToUndefined, z.string().default('__s')),
  SESSION_TTL: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().default(60 * 60 * 24 * 7), // 7 days in seconds
  ),

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
    z.string().default('production.log'),
  ),

  TEST_LOG_FILE: z.preprocess(
    emptyToUndefined,
    z.string().default('test.log'),
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
