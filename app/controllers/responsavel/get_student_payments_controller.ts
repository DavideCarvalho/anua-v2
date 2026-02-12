import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import StudentHasResponsible from '#models/student_has_responsible'
import {
  StudentPaymentsResponseDto,
  StudentPaymentDto,
  PaymentsSummaryDto,
  PaginationMetaDto,
} from '#models/dto/student_payments_response.dto'
import AppException from '#exceptions/app_exception'

export default class GetStudentPaymentsController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver os pagamentos deste aluno')
    }

    // Get payments
    const payments = await StudentPayment.query()
      .where('studentId', studentId)
      .orderBy('dueDate', 'desc')
      .paginate(page, limit)

    // Calculate payment stats
    const allPayments = await StudentPayment.query().where('studentId', studentId)

    let totalAmount = 0
    let paidAmount = 0
    let pendingAmount = 0
    let overdueAmount = 0
    const today = new Date()

    allPayments.forEach((payment) => {
      totalAmount += Number(payment.amount)
      if (payment.status === 'PAID') {
        paidAmount += Number(payment.amount)
      } else if (payment.status === 'PENDING') {
        if (new Date(payment.dueDate.toString()) < today) {
          overdueAmount += Number(payment.amount)
        } else {
          pendingAmount += Number(payment.amount)
        }
      }
    })

    const paymentsList = payments.all().map(
      (p) =>
        new StudentPaymentDto({
          id: p.id,
          type: p.type,
          amount: Number(p.amount),
          dueDate: p.dueDate,
          paidAt: p.paidAt,
          status: p.status,
          paymentGateway: p.paymentGateway,
          paymentGatewayId: p.paymentGatewayId,
        })
    )

    const paginationMeta = payments.getMeta()
    const metaDto = new PaginationMetaDto({
      total: paginationMeta.total,
      perPage: paginationMeta.perPage,
      currentPage: paginationMeta.currentPage,
      lastPage: paginationMeta.lastPage,
      firstPage: paginationMeta.firstPage,
    })

    const summaryDto = new PaymentsSummaryDto({
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paidCount: allPayments.filter((p) => p.status === 'PAID').length,
      pendingCount: allPayments.filter((p) => p.status === 'PENDING').length,
      overdueCount: allPayments.filter(
        (p) => p.status === 'PENDING' && new Date(p.dueDate.toString()) < today
      ).length,
    })

    return new StudentPaymentsResponseDto({
      data: paymentsList,
      meta: metaDto,
      summary: summaryDto,
    })
  }
}
