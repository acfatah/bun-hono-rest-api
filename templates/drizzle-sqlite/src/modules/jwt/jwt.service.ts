import { jwtVerify, SignJWT } from 'jose'
import { env } from '@/config/env'

const ALG = 'HS256'
const secretKey = new TextEncoder().encode(env.APP_SECRET)

export interface StandardJwtClaims {
  sub?: string
  iss?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}

export interface SignTokenOptions {
  /** e.g. '15m', '2h', numeric seconds, or absolute unix timestamp */
  expiresIn?: string | number
  subject?: string
  issuer?: string
  audience?: string | string[]
  jwtId?: string
}

export async function signToken(
  payload: Record<string, any>,
  options: SignTokenOptions = {},
) {
  const now = Math.floor(Date.now() / 1000)

  const jwt = new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt(now)

  if (options.subject)
    jwt.setSubject(options.subject)

  if (options.issuer)
    jwt.setIssuer(options.issuer)

  if (options.audience)
    jwt.setAudience(options.audience)

  if (options.jwtId)
    jwt.setJti(options.jwtId)

  if (options.expiresIn !== undefined) {
    let expInput: typeof options.expiresIn | undefined = options.expiresIn
    // If a numeric value is clearly not an absolute unix timestamp (i.e. far less than now), treat it as relative seconds
    if (typeof expInput === 'number') {
      // heuristic: any number less than now - 60 is considered relative seconds
      if (expInput < now - 60)
        expInput = now + Math.max(0, Math.floor(expInput))
    }
    try {
      jwt.setExpirationTime(expInput as any)
    }
    catch {
      // Fallback to default 15 minutes if parsing fails
      jwt.setExpirationTime('15m')
    }
  }
  else {
    jwt.setExpirationTime('15m')
  }

  return await jwt.sign(secretKey)
}

export async function verifyToken<T = StandardJwtClaims>(token: string) {
  const { payload } = await jwtVerify(token, secretKey, { algorithms: [ALG] })

  return payload as T
}

export async function generateToken(
  payload: Record<string, any>,
  options: SignTokenOptions = {},
): Promise<{ token: string, expiresAt?: number }> {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = options.expiresIn

  let expiresAt: number | undefined

  if (typeof expiresIn === 'number') {
    // treat large numbers as absolute unix timestamps (seconds), smaller as relative seconds
    if (expiresIn > now + 60 * 60 * 24) {
      expiresAt = expiresIn
    }
    else {
      expiresAt = now + Math.max(0, Math.floor(expiresIn))
    }
  }
  else if (typeof expiresIn === 'string') {
    // support simple "15m", "2h", "30s", "1d" formats
    const m = expiresIn.match(/^(\d+)([smhd])$/)
    if (m) {
      const val = Number.parseInt(m[1]!, 10)
      const unit = m[2]!
      let seconds = val
      if (unit === 'm')
        seconds = val * 60
      else if (unit === 'h')
        seconds = val * 60 * 60
      else if (unit === 'd')
        seconds = val * 60 * 60 * 24
      expiresAt = now + seconds
    }
    // if string is not parseable (e.g. ISO timestamp or other), leave expiresAt undefined
  }
  else {
    // default 15 minutes
    expiresAt = now + 15 * 60
  }

  const token = await signToken(payload, options)

  return { token, expiresAt }
}
