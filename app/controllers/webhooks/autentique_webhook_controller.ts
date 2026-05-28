import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import WebhookEvent from '#models/webhook_event'
import { applySignatureWebhook } from '#services/signature/enrollment_signature_service'

type AutentiqueEventType =
  | 'document.signed'
  | 'document.rejected'
  | 'document.expired'
  | 'signed'
  | 'rejected'
  | 'expired'

interface AutentiquePayload {
  event?: { type?: AutentiqueEventType } | AutentiqueEventType
  document?: { id?: string; uuid?: string; public_id?: string }
  data?: { document?: { id?: string; uuid?: string } }
  partner?: { document?: { id?: string } }
}

function extractEventType(payload: AutentiquePayload): string | null {
  if (!payload.event) return null
  if (typeof payload.event === 'string') return payload.event
  if (typeof payload.event === 'object' && payload.event.type) return payload.event.type
  return null
}

function extractDocumentId(payload: AutentiquePayload): string | null {
  return (
    payload.document?.id ??
    payload.document?.uuid ??
    payload.document?.public_id ??
    payload.data?.document?.id ??
    payload.data?.document?.uuid ??
    payload.partner?.document?.id ??
    null
  )
}

function mapEventToStatus(event: string): 'SIGNED' | 'DECLINED' | 'EXPIRED' | null {
  const normalized = event.toLowerCase()
  if (normalized.includes('signed')) return 'SIGNED'
  if (normalized.includes('rejected') || normalized.includes('declined')) return 'DECLINED'
  if (normalized.includes('expired')) return 'EXPIRED'
  return null
}

export default class AutentiqueWebhookController {
  async handle({ request, response }: HttpContext) {
    const payload = request.body() as AutentiquePayload

    const webhookEvent = await WebhookEvent.create({
      eventId: `autentique-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      provider: 'AUTENTIQUE',
      eventType: extractEventType(payload) ?? 'unknown',
      payload: payload as unknown as Record<string, unknown>,
      status: 'PENDING',
      attempts: 0,
    })

    const eventType = extractEventType(payload)
    const documentId = extractDocumentId(payload)

    if (!eventType || !documentId) {
      logger.warn({ payload }, '[autentique-webhook] payload sem event/document_id')
      webhookEvent.status = 'FAILED'
      webhookEvent.error = 'payload sem event/document_id'
      await webhookEvent.save()
      return response.ok({ received: true })
    }

    const status = mapEventToStatus(eventType)
    if (!status) {
      logger.info({ eventType }, '[autentique-webhook] evento ignorado')
      webhookEvent.status = 'COMPLETED'
      await webhookEvent.save()
      return response.ok({ received: true, ignored: true })
    }

    try {
      const result = await applySignatureWebhook(documentId, status)
      webhookEvent.status = 'COMPLETED'
      await webhookEvent.save()

      logger.info(
        { documentId, status, ...result },
        '[autentique-webhook] processado com sucesso'
      )
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : 'erro desconhecido'
      webhookEvent.attempts += 1
      await webhookEvent.save()
      logger.error({ documentId, error }, '[autentique-webhook] falha ao processar')
      // Não retornamos erro pro provider — retentar é decisão dele baseada em status code
    }

    return response.ok({ received: true })
  }
}
