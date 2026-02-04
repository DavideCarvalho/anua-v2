import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import { markInvoicePaidValidator } from '#validators/invoice'

export default class MarkInvoicePaidController {
  async handle({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(markInvoicePaidValidator)
    const invoice = await Invoice.findOrFail(params.id)

    if (invoice.status === 'PAID') {
      return response.conflict({ message: 'Invoice já está paga' })
    }

    if (invoice.status === 'CANCELLED') {
      return response.conflict({ message: 'Invoice está cancelada' })
    }

    const trx = await db.transaction()

    try {
      invoice.useTransaction(trx)
      invoice.status = 'PAID'
      invoice.paidAt = DateTime.now()
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
          paidAt: DateTime.now().toSQL(),
          updatedAt: DateTime.now().toSQL(),
        })

      await trx.commit()

      await invoice.load('payments')

      return response.ok(invoice)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
