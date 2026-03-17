import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import { markInvoicePaidValidator } from '#validators/invoice'
import AppException from '#exceptions/app_exception'
import InvoiceTransformer from '#transformers/invoice_transformer'

export default class MarkInvoicePaidController {
  async handle({ request, response, params, serialize }: HttpContext) {
    const payload = await request.validateUsing(markInvoicePaidValidator)
    const invoice = await Invoice.findOrFail(params.id)

    if (invoice.status === 'PAID') {
      throw AppException.operationFailedWithProvidedData(409)
    }

    if (invoice.status === 'CANCELLED') {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const trx = await db.transaction()

    try {
      const paidAt = DateTime.fromJSDate(payload.paidAt)

      invoice.useTransaction(trx)
      invoice.status = 'PAID'
      invoice.paidAt = paidAt
      invoice.paymentMethod = payload.paymentMethod
      invoice.netAmountReceived = payload.netAmountReceived
      invoice.observation = payload.observation ?? null
      await invoice.save()

      // Propagate PAID to all linked StudentPayments
      await trx
        .from('StudentPayment')
        .where('invoiceId', invoice.id)
        .whereNot('status', 'CANCELLED')
        .update({
          status: 'PAID',
          paidAt: paidAt.toSQL(),
          updatedAt: DateTime.now().toSQL(),
        })

      const paymentRows = await trx
        .from('StudentPayment')
        .where('invoiceId', invoice.id)
        .where('type', 'CANTEEN')
        .select('id')

      const canteenPaymentIds = paymentRows.map((row) => row.id)

      if (canteenPaymentIds.length > 0) {
        await trx
          .from('CanteenPurchase')
          .whereIn('studentPaymentId', canteenPaymentIds)
          .whereNot('status', 'CANCELLED')
          .update({
            status: 'PAID',
            paidAt: paidAt.toSQL(),
            updatedAt: DateTime.now().toSQL(),
          })
      }

      await trx.commit()

      await invoice.load('payments')

      return response.ok(await serialize(InvoiceTransformer.transform(invoice)))
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
