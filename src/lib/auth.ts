import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import process from 'node:process'
import * as schema from '@/db/schema'
// import { sendEmail } from '@/lib/mailer'
import { db } from '@/lib/sqlite'

export interface AuthType {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export const auth = betterAuth({
  baseUrl: process.env.BASE_URL,

  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),

  // Allow requests from the frontend development server
  trustedOrigins: [
    process.env.BASE_URL as string,
    ...(process.env.TRUSTED_ORIGINS
      ? process.env.TRUSTED_ORIGINS.replace(/ /g, '').split(',')
      : []),
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // defaults to true
    requireEmailVerification: process.env.NODE_ENV === 'production',

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
})
