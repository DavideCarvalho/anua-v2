import { Job } from '@adonisjs/queue'
import { DateTime } from 'luxon'
import WebhookEvent from '#models/webhook_event'
import EmitNfseJob from '#jobs/invoices/emit_nfse_job'
import AsaasWebhookMapper from '#services/payment/asaas_webhook_mapper'
import PaymentWebhookProcessor from '#services/payment/payment_webhook_processor'

interface ProcessAsaasInvoiceWebhookPayload {
  webhookEventId: string
}

export default class ProcessAsaasInvoiceWebhookJob extends Job<ProcessAsaasInvoiceWebhookPayload> {
  static readonly jobName = 'ProcessAsaasInvoiceWebhookJob'

  static options = {
    queue: 'payments',
    maxRetries: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { webhookEventId } = this.payload

    const webhookEvent = await WebhookEvent.find(webhookEventId)
    if (!webhookEvent) {
      console.warn(`[ASAAS_INVOICE_WEBHOOK] WebhookEvent ${webhookEventId} not found - skipping`)
      return
    }

    if (webhookEvent.status === 'COMPLETED') {
      console.log(
        `[ASAAS_INVOICE_WEBHOOK] WebhookEvent ${webhookEventId} already completed - skipping`
      )
      return
    }

    const rawPayload = webhookEvent.payload as {
      event: string
      payment?: {
        id: string
        status: string
        billingType: string
        externalReference?: string
        paymentDate?: string
        confirmedDate?: string
        dueDate?: string
        invoiceUrl?: string
        bankSlipUrl?: string
      }
    }

    const event = AsaasWebhookMapper.toPaymentEvent(rawPayload)
    if (!event || !event.externalReference) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = 'Could not map Asaas payload to payment event'
      await webhookEvent.save()
      return
    }

    try {
      webhookEvent.status = 'PROCESSING'
      webhookEvent.attempts += 1
      await webhookEvent.save()

      await PaymentWebhookProcessor.processInvoiceEvent(event.externalReference, event, 'ASAAS')

      webhookEvent.status = 'COMPLETED'
      webhookEvent.processedAt = DateTime.now()
      webhookEvent.error = null
      await webhookEvent.save()

      if (event.eventType === 'PAYMENT_CONFIRMED') {
        await EmitNfseJob.dispatch({ invoiceId: event.externalReference })
      }

      console.log(`[ASAAS_INVOICE_WEBHOOK] Invoice webhook processed: ${webhookEventId}`)
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : String(error)
      await webhookEvent.save()
      throw error
    }
  }
}
