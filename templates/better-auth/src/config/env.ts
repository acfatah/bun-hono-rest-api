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
  BASE_URL: z.url(),

  TRUSTED_ORIGINS: z.preprocess(
    (v) => {
      if (typeof v !== 'string')
        return v

      return v.split(',').map(s => s.trim()).filter(Boolean)
    },
    z.array(z.url()).default([]),
  ),

  PRODUCTION_LOG_FILE: z.string().default('production.log'),
  TEST_LOG_FILE: z.string().default('test.log'),
  SQLITE_DB_PATH: z.string().optional(),

  AUTH_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),

  BETTER_AUTH_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
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
