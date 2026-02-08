import type { HttpContext } from '@adonisjs/core/http'
import Invoice from '#models/invoice'
import StudentHasResponsible from '#models/student_has_responsible'
import InvoiceDto from '#models/dto/invoice.dto'

export default class GetStudentInvoicesController {
  async handle({ params, request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver as faturas deste aluno',
      })
    }

    const query = Invoice.query()
      .where('studentId', studentId)
      .whereHas('payments', (paymentsQuery) => {
        paymentsQuery.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      })
      .preload('student', (q) => q.preload('user'))
      .preload('payments', (q) => {
        q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        q.preload('studentHasExtraClass', (eq) => eq.preload('extraClass'))
      })
      .orderBy('year', 'asc')
      .orderBy('month', 'asc')

    const invoices = await query.paginate(page, limit)

    const allInvoices = await Invoice.query()
      .where('studentId', studentId)
      .whereHas('payments', (paymentsQuery) => {
        paymentsQuery.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      })

    let totalAmount = 0
    let paidAmount = 0
    let pendingAmount = 0
    let overdueAmount = 0

    allInvoices.forEach((invoice) => {
      totalAmount += Number(invoice.totalAmount)
      if (invoice.status === 'PAID') {
        paidAmount += Number(invoice.totalAmount)
      } else if (invoice.status === 'OVERDUE') {
        overdueAmount += Number(invoice.totalAmount)
      } else if (invoice.status === 'OPEN' || invoice.status === 'PENDING') {
        pendingAmount += Number(invoice.totalAmount)
      }
    })

    const summary = {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paidCount: allInvoices.filter((i) => i.status === 'PAID').length,
      pendingCount: allInvoices.filter((i) => ['OPEN', 'PENDING'].includes(i.status)).length,
      overdueCount: allInvoices.filter((i) => i.status === 'OVERDUE').length,
    }

    return {
      ...InvoiceDto.fromPaginator(invoices),
      summary,
    }
  }
}
