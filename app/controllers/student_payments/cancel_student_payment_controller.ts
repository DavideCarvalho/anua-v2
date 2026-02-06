import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import StudentPaymentDto from '#models/dto/student_payment.dto'
import { cancelStudentPaymentValidator } from '#validators/student_payment'
import { getQueueManager } from '#services/queue_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'

export default class CancelStudentPaymentController {
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx
    const { id } = params
    const payload = await request.validateUsing(cancelStudentPaymentValidator)
    const user = ctx.auth?.user

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    payment.status = 'CANCELLED'
    payment.metadata = {
      ...(payment.metadata || {}),
      cancelReason: payload.reason,
      cancelledAt: new Date().toISOString(),
    }
    await payment.save()

    try {
      await getQueueManager()
      await ReconcilePaymentInvoiceJob.dispatch({
        paymentId: payment.id,
        triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
        source: 'student-payments.cancel',
      })
    } catch (error) {
      console.error('[CANCEL_PAYMENT] Failed to dispatch reconcile job:', error)
    }

    await payment.load('student')

    return response.ok(new StudentPaymentDto(payment))
  }
}
