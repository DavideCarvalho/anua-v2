import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import StudentPayment from '#models/student_payment'
import type { PaymentWebhookEvent } from './payment_webhook_types.js'

export default class PaymentWebhookProcessor {
  static async processInvoiceEvent(
    invoiceId: string,
    event: PaymentWebhookEvent,
    gateway: 'ASAAS' | 'CUSTOM'
  ): Promise<void> {
    await db.transaction(async (trx) => {
      const invoice = await Invoice.query({ client: trx })
        .where('id', invoiceId)
        .forUpdate()
        .firstOrFail()

      invoice.paymentGateway = gateway
      invoice.paymentGatewayId = event.gatewayChargeId
      invoice.invoiceUrl = event.bankSlipUrl ?? event.invoiceUrl ?? invoice.invoiceUrl

      switch (event.eventType) {
        case 'PAYMENT_CONFIRMED': {
          invoice.status = 'PAID'
          invoice.paidAt = event.paidAt ? DateTime.fromISO(event.paidAt) : DateTime.now()

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
        case 'PAYMENT_CHARGEBACK':
          invoice.status = 'CANCELLED'
          break
      }

      await invoice.save()
    })
  }
}
