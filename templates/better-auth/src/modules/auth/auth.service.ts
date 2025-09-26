import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
// import { createAuthMiddleware } from "better-auth/api"
import { env } from '@/config/env'

// import { sendEmail } from '@/lib/mailer'
import { db } from '@/db'
import * as schema from '@/db/schema'

const PRODUCTION_ENVIRONTMENT = env.NODE_ENV === 'production'

export interface AuthType {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export const auth = betterAuth({
  baseURL: env.BASE_URL,

  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),

  // Allow requests from the frontend development server
  trustedOrigins: [
    env.BASE_URL as string,
    ...env.TRUSTED_ORIGINS,
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // defaults to true
    requireEmailVerification: PRODUCTION_ENVIRONTMENT,

    // emailVerification: {
    //   sendVerificationEmail: async ({ user, url, token }, request) => {
    //     await sendEmail({
    //       to: user.email,
    //       subject: 'Verify your email address',
    //       text: `Click the link to verify your email: ${url}`,
    //     })
    //   },
    // },
  },

  hooks: {
    // // Use the "after" hook to modify auth handler body response
    // after: createAuthMiddleware(async (ctx) => {
    //   if (ctx.path.startsWith("/sign-in")) {
    //     const newSession = ctx.context.newSession;

    //     if (newSession) {
    //       const { name, ...user } = newSession.user
    //       const { token } = newSession.session

    //       return { token, user }
    //     }
    //   }
    // }),
  },
})
