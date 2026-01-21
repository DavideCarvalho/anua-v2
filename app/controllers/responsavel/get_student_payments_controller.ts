import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentPaymentsController {
  async handle({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver os pagamentos deste aluno',
      })
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

    return response.ok({
      data: payments.all().map((p) => ({
        id: p.id,
        type: p.type,
        amount: Number(p.amount),
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        status: p.status,
        paymentGateway: p.paymentGateway,
        paymentGatewayId: p.paymentGatewayId,
      })),
      meta: payments.getMeta(),
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        paidCount: allPayments.filter((p) => p.status === 'PAID').length,
        pendingCount: allPayments.filter((p) => p.status === 'PENDING').length,
        overdueCount: allPayments.filter(
          (p) => p.status === 'PENDING' && new Date(p.dueDate.toString()) < today
        ).length,
      },
    })
  }
}
