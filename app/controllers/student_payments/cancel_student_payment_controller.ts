import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import { cancelStudentPaymentValidator } from '#validators/student_payment'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import AppException from '#exceptions/app_exception'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'

export default class CancelStudentPaymentController {
  async handle(ctx: HttpContext) {
    const { params, request, response, logger, serialize } = ctx
    const { id } = params
    const payload = await request.validateUsing(cancelStudentPaymentValidator)
    const user = ctx.auth?.user

    const payment = await StudentPayment.find(id)

    if (!payment) {
      throw AppException.notFound('Pagamento do aluno não encontrado')
    }

    payment.status = 'CANCELLED'
    payment.metadata = {
      ...(payment.metadata || {}),
      cancelReason: payload.reason,
      cancelledAt: new Date().toISOString(),
    }
    await payment.save()

    try {
      await ReconcilePaymentInvoiceJob.dispatch({
        paymentId: payment.id,
        triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
        source: 'student-payments.cancel',
      })
    } catch (error) {
      logger.error({ error }, '[CANCEL_PAYMENT] Failed to dispatch reconcile job')
    }

    await payment.load('student')

    return response.ok(await serialize(StudentPaymentTransformer.transform(payment)))
  }
}
