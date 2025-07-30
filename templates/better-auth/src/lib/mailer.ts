import { logger } from '@/lib/logger'

export function sendEmail(payload: unknown) {
  // TBD: Implement mailer
  logger.warn(payload, 'Mailer not implemented!')
}
