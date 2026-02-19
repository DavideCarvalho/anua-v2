import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import StudentPayment from '#models/student_payment'
import WebhookEvent from '#models/webhook_event'
import EmitNfseJob from '#jobs/invoices/emit_nfse_job'

interface ProcessAsaasPaymentWebhookPayload {
  webhookEventId: string
}

export default class ProcessAsaasPaymentWebhookJob extends Job<ProcessAsaasPaymentWebhookPayload> {
  static readonly jobName = 'ProcessAsaasPaymentWebhookJob'

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
      console.warn(`[ASAAS_WEBHOOK] WebhookEvent ${webhookEventId} not found - skipping`)
      return
    }

    if (webhookEvent.status === 'COMPLETED') {
      console.log(`[ASAAS_WEBHOOK] WebhookEvent ${webhookEventId} already completed - skipping`)
      return
    }

    const payload = webhookEvent.payload as {
      event: string
      payment: {
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

    try {
      webhookEvent.status = 'PROCESSING'
      webhookEvent.attempts += 1
      await webhookEvent.save()

      await db.transaction(async (trx) => {
        const payment = await StudentPayment.query({ client: trx })
          .where('id', payload.payment.externalReference!)
          .forUpdate()
          .firstOrFail()

        payment.paymentGateway = 'ASAAS'
        payment.paymentGatewayId = payload.payment.id
        payment.invoiceUrl =
          payload.payment.bankSlipUrl ?? payload.payment.invoiceUrl ?? payment.invoiceUrl

        switch (payload.event) {
          case 'PAYMENT_CONFIRMED':
          case 'PAYMENT_RECEIVED': {
            payment.status = 'PAID'
            const paidAt = payload.payment.confirmedDate ?? payload.payment.paymentDate
            payment.paidAt = paidAt ? DateTime.fromISO(paidAt) : DateTime.now()
            break
          }
          case 'PAYMENT_OVERDUE':
            payment.status = 'OVERDUE'
            break
          case 'PAYMENT_DELETED':
            payment.status = 'CANCELLED'
            break
          case 'PAYMENT_CREATED':
            payment.status = 'PENDING'
            break
          case 'PAYMENT_UPDATED':
            payment.status = payment.status ?? 'PENDING'
            break
          case 'PAYMENT_REFUNDED':
          case 'PAYMENT_CHARGEBACK_REQUESTED':
            payment.status = 'CANCELLED'
            break
          default:
            break
        }

        await payment.save()

        webhookEvent.useTransaction(trx)
        webhookEvent.status = 'COMPLETED'
        webhookEvent.processedAt = DateTime.now()
        webhookEvent.error = null
        await webhookEvent.save()
      })

      // Dispatch NFS-e emission if linked invoice became PAID
      if (payload.event === 'PAYMENT_CONFIRMED' || payload.event === 'PAYMENT_RECEIVED') {
        const freshPayment = await StudentPayment.find(payload.payment.externalReference!)
        if (freshPayment?.invoiceId) {
          const invoiceModule = await import('#models/invoice')
          const Invoice = invoiceModule.default
          const invoice = await Invoice.find(freshPayment.invoiceId)
          if (invoice?.status === 'PAID') {
            await EmitNfseJob.dispatch({ invoiceId: invoice.id })
          }
        }
      }

      console.log(`[ASAAS_WEBHOOK] Payment webhook processed: ${webhookEventId}`)
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : String(error)
      await webhookEvent.save()
      throw error
    }
  }
}
