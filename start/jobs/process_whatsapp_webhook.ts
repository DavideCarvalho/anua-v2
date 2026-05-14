import logger from '@adonisjs/core/services/logger'
import { WhatsappChatService } from '#ai/whatsapp_chat_service'
import { getAraraService } from '#services/arara_service'

export interface WhatsAppWebhookPayload {
  event: string
  data: Record<string, unknown>
}

type StatusUpdatePayload = {
  messageId?: string
  status?: string
  errorDetails?: unknown
}

type MessageReceivedPayload = {
  from?: string
  body?: string
  id?: string
}

type TemplateUpdatedPayload = {
  name?: string
  status?: string
}

export async function processWhatsAppWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
  const { event, data } = payload

  switch (event) {
    case 'message.status_updated': {
      const { messageId, status, errorDetails } = data as StatusUpdatePayload
      if (status === 'DELIVERED' || status === 'READ') {
        logger.info({ messageId, status }, 'WhatsApp message delivered')
      } else if (status === 'FAILED') {
        logger.error({ messageId, errorDetails }, 'WhatsApp message failed')
      }
      break
    }

    case 'message.received': {
      await handleMessageReceived(data as MessageReceivedPayload)
      break
    }

    case 'template.updated': {
      const { name, status } = data as TemplateUpdatedPayload
      logger.info({ templateName: name, status }, 'WhatsApp template status updated')
      break
    }

    default:
      logger.debug({ event }, 'Unknown WhatsApp webhook event')
  }
}

async function handleMessageReceived(data: MessageReceivedPayload): Promise<void> {
  const from = (data.from ?? '').trim()
  const body = (data.body ?? '').trim()

  if (!from || !body) {
    logger.warn({ data }, 'WhatsApp message received with empty from/body')
    return
  }

  // Arara entrega `from` como "whatsapp:+5511999990000" ou similar. Reduzimos
  // pra dígitos puros pra fazer o match no User.phone (que pode estar com
  // formatação variável).
  const fromDigits = from.replace(/\D/g, '')

  const service = new WhatsappChatService()
  const result = await service.chat({ fromDigits, body })

  if (result.kind === 'silent') {
    logger.info({ from: fromDigits, reason: result.reason }, 'WhatsApp inbound dropped')
    return
  }

  try {
    const arara = getAraraService()
    await arara.sendSessionMessage({
      receiver: from.startsWith('whatsapp:') ? from : `whatsapp:+${fromDigits}`,
      body: result.text,
    })
  } catch (err) {
    logger.error({ err, from: fromDigits }, 'failed to send WhatsApp reply')
  }
}
