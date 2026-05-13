import type { HttpContext } from '@adonisjs/core/http'
import { getAraraService } from '#services/arara_service'
import logger from '@adonisjs/core/services/logger'

export default class WhatsAppWebhookController {
  async handle({ request, response }: HttpContext) {
    const signature = request.header('X-Arara-Signature') || ''
    const rawBody = request.raw()

    if (!rawBody) {
      return response.status(400).json({ error: 'Empty body' })
    }

    if (signature) {
      const araraService = getAraraService()
      if (!araraService.verifyWebhook(rawBody, signature)) {
        return response.status(401).json({ error: 'Invalid signature' })
      }
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
