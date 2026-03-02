import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import SubscriptionInvoice from '#models/subscription_invoice'
import type Subscription from '#models/subscription'
import AsaasService from '#services/asaas_service'
import GenerateSubscriptionInvoices from '#start/jobs/generate_subscription_invoices'

const MAX_RETRY_ATTEMPTS = 3
const RETRY_INTERVAL_DAYS = 3

export default class RetrySubscriptionInvoiceCharges {
  static async handle() {
    const now = DateTime.now()
    const asaasService = await app.container.make(AsaasService)

    const invoices = await SubscriptionInvoice.query()
      .where('collectionStatus', 'RETRYING')
      .whereNotNull('nextChargeRetryAt')
      .where('chargeRetryCount', '<', MAX_RETRY_ATTEMPTS)
      .where('nextChargeRetryAt', '<=', now.toSQL()!)
      .preload('subscription', (q) =>
        q.preload('school', (sq) => sq.preload('schoolChain')).preload('schoolChain')
      )

    let processed = 0
    let charged = 0
    let delinquent = 0
    let failed = 0

    for (const invoice of invoices) {
      processed++

      const subscription = invoice.subscription
      if (!subscription) {
        failed++
        continue
      }

      if (!(subscription.paymentMethod === 'CREDIT_CARD' && subscription.creditCardToken)) {
        invoice.collectionStatus = 'DELINQUENT'
        invoice.status = 'OVERDUE'
        invoice.nextChargeRetryAt = null
        invoice.lastChargeError = 'Assinatura sem cartão configurado para retentativa automática'
        await invoice.save()
        await this.markSubscriptionPastDue(subscription)
        delinquent++
        continue
      }

      const result = await GenerateSubscriptionInvoices.createAsaasChargeForInvoice({
        invoice,
        subscription,
        asaasService,
        dueDate: invoice.dueDate,
      })

      if (result.status === 'charged') {
        invoice.collectionStatus = 'PENDING'
        invoice.nextChargeRetryAt = null
        invoice.lastChargeError = null
        await invoice.save()
        charged++
        continue
      }

      if (result.status === 'skipped') {
        failed++
        continue
      }

      const nextRetryCount = invoice.chargeRetryCount + 1
      invoice.chargeRetryCount = nextRetryCount

      if (nextRetryCount >= MAX_RETRY_ATTEMPTS) {
        invoice.collectionStatus = 'DELINQUENT'
        invoice.status = 'OVERDUE'
        invoice.nextChargeRetryAt = null
        invoice.lastChargeError = result.error ?? 'Falha na cobrança automática após retentativas'
        await invoice.save()
        await this.markSubscriptionPastDue(subscription)
        delinquent++
      } else {
        invoice.collectionStatus = 'RETRYING'
        invoice.nextChargeRetryAt = now.plus({ days: RETRY_INTERVAL_DAYS })
        invoice.lastChargeError = result.error ?? 'Falha na cobrança automática'
        await invoice.save()
        failed++
      }
    }

    logger.info('[SUBSCRIPTION_INVOICES] Retry run finished', {
      processed,
      charged,
      delinquent,
      failed,
    })

    return { processed, charged, delinquent, failed }
  }

  private static async markSubscriptionPastDue(subscription: Subscription) {
    if (subscription.status === 'PAST_DUE') return
    subscription.status = 'PAST_DUE'
    await subscription.save()
  }
}
