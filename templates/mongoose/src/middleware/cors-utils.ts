import { env } from '@/config/env'

export function handleOrigin(origin: string) {
  const trustedOrigins = env.TRUSTED_ORIGINS

  if (trustedOrigins.includes(origin)) {
    return origin
  }

  if ([undefined, 'test', 'development'].includes(env.NODE_ENV)) {
    return '*'
  }
}
