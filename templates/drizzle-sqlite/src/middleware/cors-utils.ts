import process from 'node:process'

export function handleOrigin(origin: string) {
  const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || []

  if (trustedOrigins.includes(origin)) {
    return origin
  }

  if ([undefined, 'test', 'development'].includes(process.env.NODE_ENV)) {
    return '*'
  }
}
