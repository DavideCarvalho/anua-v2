import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import StudentPaymentDto from '#models/dto/student_payment.dto'
import { updateStudentPaymentValidator } from '#validators/student_payment'
import { getQueueManager } from '#services/queue_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'

export default class UpdateStudentPaymentController {
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx
    const { id } = params
    const payload = await request.validateUsing(updateStudentPaymentValidator)
    const user = ctx.auth?.user

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    const updateData = {
      ...payload,
      dueDate: payload.dueDate ? DateTime.fromJSDate(payload.dueDate) : undefined,
    }

    payment.merge(updateData)
    await payment.save()

    try {
      await getQueueManager()
      await ReconcilePaymentInvoiceJob.dispatch({
        paymentId: payment.id,
        triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
        source: 'student-payments.update',
      })
    } catch (error) {
      console.error('[UPDATE_PAYMENT] Failed to dispatch reconcile job:', error)
    }

    await payment.load('student')

    return response.ok(new StudentPaymentDto(payment))
  }
}
