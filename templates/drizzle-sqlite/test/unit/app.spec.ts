import { describe, expect, it } from 'bun:test'
import app from '@/index'
import '../bootstrap'

describe('app', () => {
  describe('the GET /health', () => {
    it('should return a 200 status and a JSON response', async () => {
      const res = await app.request('/health')

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        status: 'ok',
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      })
    })
  })
})
