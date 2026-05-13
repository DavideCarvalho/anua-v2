import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export default class WhatsAppWebhookController {
  async handle({ request, response }: HttpContext) {
    const expectedToken = env.get('ARARA_WEBHOOK_TOKEN')
    const receivedToken = request.header('x-webhook-token') || request.input('token', '')

    if (expectedToken && receivedToken !== expectedToken) {
      logger.warn({ receivedToken }, 'Invalid webhook token')
      return response.status(401).json({ error: 'Invalid webhook token' })
    }

    const event = request.input('event')
    const data = request.input('data', {})

    switch (event) {
      case 'message.status_updated': {
        const { messageId, status, errorDetails } = data
        if (status === 'DELIVERED' || status === 'READ') {
          logger.info({ messageId, status }, 'WhatsApp message delivered')
        } else if (status === 'FAILED') {
          logger.error({ messageId, errorDetails }, 'WhatsApp message failed')
        }
        break
      }

      case 'message.received': {
        logger.info({ from: data.from, body: data.body }, 'WhatsApp message received')
        break
      }

      case 'template.updated': {
        logger.info({ templateName: data.name, status: data.status }, 'WhatsApp template status updated')
        break
      }

      default:
        logger.debug({ event }, 'Unknown WhatsApp webhook event')
    }

    return response.ok({ received: true })
  }
}
