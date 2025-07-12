import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import process from 'node:process'
import { db } from '@/lib/sqlite'

export interface AuthType {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),

  // Allow requests from the frontend development server
  trustedOrigins: [
    ...(process.env.TRUSTED_ORIGINS
      ? process.env.TRUSTED_ORIGINS.replace(/ /g, '').split(',')
      : []),
  ],

  emailAndPassword: {
    enabled: true,
  },
})
