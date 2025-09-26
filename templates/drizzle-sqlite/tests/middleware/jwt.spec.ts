import { describe, expect, it } from 'bun:test'
import '../bootstrap'
import { Hono } from 'hono'
import { jwt } from '@/middleware/jwt'
import { signToken } from '@/modules/jwt/jwt.service'

function buildApp(required = true, passthroughOnError = false) {
  const app = new Hono()
  app.use('*', jwt({ required, passthroughOnError }))
  app.get('/protected', c => c.json({ ok: true, claims: c.get('jwtClaims') || null }))

  return app
}

describe('jwt middleware', () => {
  it('rejects missing token when required', async () => {
    const app = buildApp(true)
    const res = await app.request('/protected')
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Missing token' })
  })

  it('allows missing token when not required', async () => {
    const app = buildApp(false)
    const res = await app.request('/protected')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, claims: null })
  })

  it('accepts valid bearer token and sets claims', async () => {
    const token = await signToken({ role: 'user' }, { subject: 'u-1' })
    const app = buildApp(true)
    const res = await app.request('/protected', { headers: { authorization: `Bearer ${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.ok).toBe(true)
    expect(body.claims.role).toBe('user')
    expect(body.claims.sub).toBe('u-1')
  })

  it('rejects invalid token when required and no passthrough', async () => {
    const app = buildApp(true, false)
    const res = await app.request('/protected', { headers: { authorization: 'Bearer invalid.token.here' } })
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Invalid token' })
  })

  it('passes through on invalid token when passthroughOnError=true', async () => {
    const app = buildApp(true, true)
    const res = await app.request('/protected', { headers: { authorization: 'Bearer invalid' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, claims: null })
  })

  it('supports custom header name', async () => {
    const token = await signToken({ role: 'custom' })
    const app = new Hono()
    app.use('*', jwt({ required: true, header: 'x-auth' }))
    app.get('/protected', c => c.json({ claims: (c.get as any)('jwtClaims') || null }))
    const res = await app.request('/protected', { headers: { 'x-auth': `Bearer ${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.claims.role).toBe('custom')
  })
})
