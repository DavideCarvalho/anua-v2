import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import { createStudentPaymentValidator } from '#validators/student_payment'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'

export default class CreateStudentPaymentController {
  async handle(ctx: HttpContext) {
    const { request, response, logger, serialize } = ctx
    const payload = await request.validateUsing(createStudentPaymentValidator)
    const user = ctx.auth?.user

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
      discountType: payload.discountType ?? 'PERCENTAGE',
      discountValue: payload.discountValue ?? 0,
      contractId: payload.contractId,
      classHasAcademicPeriodId: payload.classHasAcademicPeriodId ?? null,
      studentHasLevelId: payload.studentHasLevelId ?? null,
    })

    try {
      await ReconcilePaymentInvoiceJob.dispatch({
        paymentId: payment.id,
        triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
        source: 'student-payments.create',
      })
    } catch (error) {
      logger.error({ error }, '[CREATE_PAYMENT] Failed to dispatch reconcile job')
    }

    await payment.load('student')

    return response.created(await serialize(StudentPaymentTransformer.transform(payment)))
  }
}
