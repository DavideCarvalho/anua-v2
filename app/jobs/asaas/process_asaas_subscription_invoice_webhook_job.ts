import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SubscriptionInvoice from '#models/subscription_invoice'
import Subscription from '#models/subscription'
import WebhookEvent from '#models/webhook_event'

interface ProcessAsaasSubscriptionInvoiceWebhookPayload {
  webhookEventId: string
}

export default class ProcessAsaasSubscriptionInvoiceWebhookJob extends Job<ProcessAsaasSubscriptionInvoiceWebhookPayload> {
  static readonly jobName = 'ProcessAsaasSubscriptionInvoiceWebhookJob'

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
    if (!webhookEvent || webhookEvent.status === 'COMPLETED') {
      return
    }

    const payload = webhookEvent.payload as {
      event: string
      payment: {
        id: string
        externalReference?: string
        paymentDate?: string
        confirmedDate?: string
        invoiceUrl?: string
        bankSlipUrl?: string
      }
    }

    try {
      webhookEvent.status = 'PROCESSING'
      webhookEvent.attempts += 1
      await webhookEvent.save()

      await db.transaction(async (trx) => {
        const invoice = await SubscriptionInvoice.query({ client: trx })
          .where('id', payload.payment.externalReference!)
          .forUpdate()
          .firstOrFail()

        const subscription = await Subscription.query({ client: trx })
          .where('id', invoice.subscriptionId)
          .forUpdate()
          .first()

        invoice.paymentGatewayId = payload.payment.id
        invoice.invoiceUrl =
          payload.payment.bankSlipUrl ?? payload.payment.invoiceUrl ?? invoice.invoiceUrl

        switch (payload.event) {
          case 'PAYMENT_CONFIRMED':
          case 'PAYMENT_RECEIVED':
            invoice.status = 'PAID'
            invoice.collectionStatus = 'PAID'
            invoice.paidAt = payload.payment.confirmedDate
              ? DateTime.fromISO(payload.payment.confirmedDate)
              : payload.payment.paymentDate
                ? DateTime.fromISO(payload.payment.paymentDate)
                : DateTime.now()
            invoice.nextChargeRetryAt = null
            invoice.lastChargeError = null
            if (subscription && subscription.status === 'PAST_DUE') {
              subscription.status = 'ACTIVE'
              await subscription.save()
            }
            break
          case 'PAYMENT_OVERDUE':
            invoice.status = 'OVERDUE'
            invoice.collectionStatus = 'DELINQUENT'
            if (subscription) {
              subscription.status = 'PAST_DUE'
              await subscription.save()
            }
            break
          case 'PAYMENT_DELETED':
          case 'PAYMENT_REFUNDED':
          case 'PAYMENT_CHARGEBACK_REQUESTED':
            invoice.status = 'CANCELED'
            invoice.collectionStatus = 'DELINQUENT'
            break
          case 'PAYMENT_CREATED':
          case 'PAYMENT_UPDATED':
          default:
            invoice.status = invoice.status || 'PENDING'
            break
        }

        await invoice.save()

        webhookEvent.useTransaction(trx)
        webhookEvent.status = 'COMPLETED'
        webhookEvent.processedAt = DateTime.now()
        webhookEvent.error = null
        await webhookEvent.save()
      })
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : String(error)
      await webhookEvent.save()
      throw error
    }
  }
}
