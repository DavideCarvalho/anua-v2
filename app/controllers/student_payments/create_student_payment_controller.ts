import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import { createStudentPaymentValidator } from '#validators/student_payment'

export default class CreateStudentPaymentController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createStudentPaymentValidator)

    const payment = await StudentPayment.create({
      studentId: payload.studentId,
      amount: payload.amount,
      month: payload.month,
      year: payload.year,
      type: payload.type,
      status: 'NOT_PAID',
      totalAmount: payload.totalAmount,
      dueDate: DateTime.fromJSDate(payload.dueDate),
      installments: payload.installments ?? 1,
      installmentNumber: payload.installmentNumber ?? 1,
      discountPercentage: payload.discountPercentage ?? 0,
      contractId: payload.contractId,
      classHasAcademicPeriodId: payload.classHasAcademicPeriodId ?? null,
      studentHasLevelId: payload.studentHasLevelId ?? null,
    })

    await payment.load('student')

    return response.created(payment)
  }
}
