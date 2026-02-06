import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentHasExtraClass from '#models/student_has_extra_class'
import StudentPayment from '#models/student_payment'
import Invoice from '#models/invoice'

export default class CancelExtraClassEnrollmentController {
  async handle({ params, response }: HttpContext) {
    const enrollment = await StudentHasExtraClass.query()
      .where('id', params.enrollmentId)
      .where('extraClassId', params.id)
      .whereNull('cancelledAt')
      .first()

    if (!enrollment) {
      return response.notFound({ message: 'Inscrição não encontrada' })
    }

    enrollment.cancelledAt = DateTime.now()
    await enrollment.save()

    // Cancel future unpaid payments
    const futurePayments = await StudentPayment.query()
      .where('studentHasExtraClassId', enrollment.id)
      .whereIn('status', ['NOT_PAID', 'PENDING', 'OVERDUE'])

    const invoiceIds = new Set<string>()

    for (const payment of futurePayments) {
      if (payment.invoiceId) invoiceIds.add(payment.invoiceId)
      payment.status = 'CANCELLED'
      payment.metadata = {
        ...(payment.metadata || {}),
        cancelReason: 'Inscrição em aula avulsa cancelada',
      }
      await payment.save()
    }

    // Reconcile affected invoices
    for (const invoiceId of invoiceIds) {
      const invoice = await Invoice.find(invoiceId)
      if (!invoice || ['PAID', 'CANCELLED', 'RENEGOTIATED'].includes(invoice.status)) continue

      const linkedPayments = await StudentPayment.query()
        .where('invoiceId', invoiceId)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

      invoice.totalAmount = linkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      await invoice.save()
    }

    return response.noContent()
  }
}
