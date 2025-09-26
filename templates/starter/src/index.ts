import { createApp } from './app'
import { env } from './config/env'

const app = createApp()

export default {
  fetch: app.fetch,
  request: app.request,
  port: env.PORT,
}
