import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import StudentPaymentDto from '#models/dto/student_payment.dto'
import { updateStudentPaymentValidator } from '#validators/student_payment'
import { getQueueManager } from '#services/queue_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import AppException from '#exceptions/app_exception'

export default class UpdateStudentPaymentController {
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx
    const { id } = params
    const payload = await request.validateUsing(updateStudentPaymentValidator)
    const user = ctx.auth?.user

    const payment = await StudentPayment.find(id)

    if (!payment) {
      throw AppException.notFound('Pagamento do aluno não encontrado')
    }

    const nextDiscountType = payload.discountType ?? payment.discountType
    const nextDiscountPercentage = payload.discountPercentage ?? payment.discountPercentage
    const nextDiscountValue = payload.discountValue ?? payment.discountValue

    let nextAmount = payload.amount ?? payment.amount
    const hasDiscountChange =
      payload.discountType !== undefined ||
      payload.discountPercentage !== undefined ||
      payload.discountValue !== undefined

    if (payload.amount !== undefined || hasDiscountChange) {
      if (nextDiscountType === 'FLAT') {
        nextAmount = Math.max(0, nextAmount - nextDiscountValue)
      } else {
        nextAmount = Math.max(0, Math.round(nextAmount * (1 - nextDiscountPercentage / 100)))
      }
    }

    const updateData = {
      ...payload,
      amount: nextAmount,
      totalAmount: nextAmount,
      discountType: nextDiscountType,
      discountPercentage: nextDiscountType === 'PERCENTAGE' ? nextDiscountPercentage : 0,
      discountValue: nextDiscountType === 'FLAT' ? nextDiscountValue : 0,
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
