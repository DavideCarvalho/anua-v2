import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import StudentPayment from '#models/student_payment'
import WebhookEvent from '#models/webhook_event'
import EmitNfseJob from '#jobs/invoices/emit_nfse_job'

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
        const invoice = await Invoice.query({ client: trx })
          .where('id', payload.payment.externalReference!)
          .forUpdate()
          .firstOrFail()

        invoice.paymentGateway = 'ASAAS'
        invoice.paymentGatewayId = payload.payment.id
        invoice.invoiceUrl =
          payload.payment.bankSlipUrl ?? payload.payment.invoiceUrl ?? invoice.invoiceUrl

        switch (payload.event) {
          case 'PAYMENT_CONFIRMED':
          case 'PAYMENT_RECEIVED': {
            invoice.status = 'PAID'
            const paidAt = payload.payment.confirmedDate ?? payload.payment.paymentDate
            invoice.paidAt = paidAt ? DateTime.fromISO(paidAt) : DateTime.now()

            // Marcar todos os StudentPayments vinculados como PAID
            await StudentPayment.query({ client: trx })
              .where('invoiceId', invoice.id)
              .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
              .update({ status: 'PAID', paidAt: invoice.paidAt.toISO() })
            break
          }
          case 'PAYMENT_OVERDUE':
            invoice.status = 'OVERDUE'
            break
          case 'PAYMENT_DELETED':
            invoice.paymentGatewayId = null
            invoice.status = 'OPEN'
            break
          case 'PAYMENT_CREATED':
            invoice.status = 'PENDING'
            break
          case 'PAYMENT_UPDATED':
            invoice.status = invoice.status ?? 'PENDING'
            break
          case 'PAYMENT_REFUNDED':
          case 'PAYMENT_CHARGEBACK_REQUESTED':
            invoice.status = 'CANCELLED'
            break
          default:
            break
        }

        await invoice.save()

        webhookEvent.useTransaction(trx)
        webhookEvent.status = 'COMPLETED'
        webhookEvent.processedAt = DateTime.now()
        webhookEvent.error = null
        await webhookEvent.save()
      })

      // Dispatch NFS-e emission after payment confirmed
      if (
        (payload.event === 'PAYMENT_CONFIRMED' || payload.event === 'PAYMENT_RECEIVED') &&
        payload.payment.externalReference
      ) {
        await EmitNfseJob.dispatch({ invoiceId: payload.payment.externalReference })
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
