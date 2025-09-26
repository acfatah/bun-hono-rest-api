import { describe, expect, it } from 'bun:test'
import '../bootstrap'
import { generateToken, signToken, verifyToken } from '@/modules/jwt/jwt.service'

// Helper: small sleep to ensure iat differences if needed
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

describe('jwt.provider', () => {
  it('signs and verifies a simple token', async () => {
    const token = await signToken({ role: 'tester' }, { subject: 'user-123' })
    expect(typeof token).toBe('string')

    const claims = await verifyToken(token)
    expect(claims.role).toBe('tester')
    expect(claims.sub).toBe('user-123')
    expect(typeof claims.iat).toBe('number')
    expect(typeof claims.exp).toBe('number')
  })

  it('respects custom expiresIn (relative seconds)', async () => {
    const token = await signToken({ foo: 'bar' }, { expiresIn: 2 })
    const claims = await verifyToken(token)
    expect(claims.foo).toBe('bar')
    // exp should be close to iat + 2
    expect(claims.exp! - claims.iat!).toBeLessThanOrEqual(3)
    expect(claims.exp! - claims.iat!).toBeGreaterThanOrEqual(2)
  })

  it('generateToken returns expiresAt for numeric relative seconds', async () => {
    const { token, expiresAt } = await generateToken({ a: 1 }, { expiresIn: 10 })
    expect(typeof token).toBe('string')
    expect(typeof expiresAt).toBe('number')
    const claims = await verifyToken(token)
    expect(claims.a).toBe(1)
    expect(claims.exp).toBeDefined()
    // expiresAt should roughly match claims.exp
    if (claims.exp && expiresAt) {
      expect(Math.abs(claims.exp - expiresAt)).toBeLessThanOrEqual(1)
    }
  })

  it('generateToken parses simple duration strings', async () => {
    const { token, expiresAt } = await generateToken({ x: true }, { expiresIn: '2m' })
    expect(expiresAt).toBeDefined()
    const claims = await verifyToken(token)
    // 120 seconds window
    if (claims.exp && claims.iat) {
      expect(claims.exp - claims.iat).toBeGreaterThanOrEqual(119)
      expect(claims.exp - claims.iat).toBeLessThanOrEqual(121)
    }
  })

  it('generateToken leaves expiresAt undefined for unparsable string but token still valid (default 15m inside signToken)', async () => {
    const { token, expiresAt } = await generateToken({ y: 2 }, { expiresIn: 'not-a-duration' })
    expect(expiresAt).toBeUndefined()
    const claims = await verifyToken(token)
    // default signToken expiration is 15m => 900 seconds
    if (claims.exp && claims.iat) {
      expect(claims.exp - claims.iat).toBeGreaterThanOrEqual(899)
      expect(claims.exp - claims.iat).toBeLessThanOrEqual(901)
    }
  })

  it('supports absolute unix timestamp expiration (numeric > now + 1 day)', async () => {
    const now = Math.floor(Date.now() / 1000)
    const abs = now + 60 * 60 * 24 * 3 // 3 days
    const { token, expiresAt } = await generateToken({ abs: true }, { expiresIn: abs })
    expect(expiresAt).toBe(abs)
    const claims = await verifyToken(token)
    expect(claims.exp).toBe(abs)
  })

  it('different tokens should have different jti when provided', async () => {
    const t1 = await signToken({ k: 1 }, { jwtId: 'id-1' })
    await sleep(5)
    const t2 = await signToken({ k: 1 }, { jwtId: 'id-2' })
    const c1 = await verifyToken(t1)
    const c2 = await verifyToken(t2)
    expect(c1.jti).toBe('id-1')
    expect(c2.jti).toBe('id-2')
  })
})
