import process from 'node:process'
import { z } from 'zod'

const EnvSchema = z.object({
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BASE_URL: z.url(),
  PORT: z.coerce.number().optional(),

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
