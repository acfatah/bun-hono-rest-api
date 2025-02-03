import { Hono } from 'hono'

export interface HealthCheck {
  status: string
  uptime: number
  timestamp: string
  error?: string
}
export const healthRoute = new Hono()

healthRoute.get('/health', (ctx) => {
  const healthCheck: HealthCheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }

  try {
    // Add any additional checks (e.g., database connection) here.

    ctx.status(200)

    return ctx.json(healthCheck)
  }
  catch (error) {
    healthCheck.status = 'unhealthy'

    if (error instanceof Error)
      healthCheck.error = error.message

    ctx.status(503)

    return ctx.json(healthCheck)
  }
})
