import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import StudentHasResponsible from '#models/student_has_responsible'
import InvoiceDto from '#models/dto/invoice.dto'
import AppException from '#exceptions/app_exception'
import AsaasService from '#services/asaas_service'

@inject()
export default class GetStudentInvoicesController {
  constructor(private asaasService: AsaasService) {}

  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as faturas deste aluno')
    }

    const query = Invoice.query()
      .where('studentId', studentId)
      .whereHas('payments', (paymentsQuery) => {
        paymentsQuery.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      })
      .preload('student', (q) => q.preload('user'))
      .preload('payments', (q) => {
        q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        q.preload('contract')
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

    // Check if school has Asaas enabled via the first invoice's contract
    let asaasEnabled = false
    const firstInvoice = invoices.all().find((i) => i.payments?.length > 0)
    if (firstInvoice) {
      const contract = await Contract.query()
        .where('id', firstInvoice.payments[0].contractId)
        .preload('school', (sq) => sq.preload('schoolChain'))
        .first()

      if (contract?.school && contract.school.paymentConfigStatus === 'ACTIVE') {
        asaasEnabled = !!this.asaasService.resolveAsaasConfig(contract.school)
      }
    }

    return {
      ...InvoiceDto.fromPaginator(invoices),
      summary,
      asaasEnabled,
    }
  }
}
