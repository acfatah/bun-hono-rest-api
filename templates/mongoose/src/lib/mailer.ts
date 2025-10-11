import type { SendMailOptions, Transporter } from 'nodemailer'
import nodemailer from 'nodemailer'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!env.ENABLE_SMTP_MAILER)
    return null

  if (transporter)
    return transporter

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port: env.SMTP_PORT!,
    secure: env.SMTP_SECURE!,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  })

  return transporter
}

export interface EmailPayload {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  headers?: SendMailOptions['headers']
}

export async function sendEmail(payload: EmailPayload) {
  if (!env.ENABLE_SMTP_MAILER) {
    logger.warn({ payload }, 'Mailer disabled; email not sent')

    return false
  }

  const mailer = getTransporter()
  if (!mailer) {
    logger.error('Mailer not initialised')

    return false
  }

  const { to, subject, text, html, headers } = payload

  const message: SendMailOptions = {
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html,
    headers,
  }

  try {
    const result = await mailer.sendMail(message)
    logger.info({ payload, result }, 'Email sent')

    return true
  }
  catch (err) {
    logger.error({ err, payload }, 'Failed to send email')

    return false
  }
}

// Simple health check utility (can be used in a readiness probe)
export async function verifyMailer() {
  if (!env.ENABLE_SMTP_MAILER)
    return true // treat disabled as healthy

  const mailer = getTransporter()
  if (!mailer)
    return false
  try {
    await mailer.verify()

    return true
  }
  catch (err) {
    logger.error({ err }, 'SMTP verification failed')

    return false
  }
}
