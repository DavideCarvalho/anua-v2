import logger from '@adonisjs/core/services/logger'

export interface WhatsAppWebhookPayload {
  event: string
  data: Record<string, unknown>
}

export async function processWhatsAppWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
  const { event, data } = payload

  switch (event) {
    case 'message.status_updated': {
      const { messageId, status, errorDetails } = data as any
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
      logger.info({ templateName: (data as any).name, status: (data as any).status }, 'WhatsApp template status updated')
      break
    }

    default:
      logger.debug({ event }, 'Unknown WhatsApp webhook event')
  }
}
