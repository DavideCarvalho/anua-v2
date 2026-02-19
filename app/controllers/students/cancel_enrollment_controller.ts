import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import AppException from '#exceptions/app_exception'
import { getQueueManager } from '#services/queue_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'

const CANCELLABLE_PAYMENT_STATUSES = ['NOT_PAID', 'PENDING', 'OVERDUE'] as const

export default class CancelEnrollmentController {
  async handle(ctx: HttpContext) {
    const { params, response } = ctx
    const { id: studentId, enrollmentId } = params
    const user = ctx.auth?.user

    const enrollment = await StudentHasLevel.query()
      .where('id', enrollmentId)
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .first()

    if (!enrollment) {
      throw AppException.notFound('Matrícula não encontrada')
    }

    const now = DateTime.now()
    const startOfToday = now.startOf('day')

    const paymentIdsToReconcile = await db.transaction(async (trx) => {
      const linkedPayments = await StudentPayment.query({ client: trx })
        .where('studentHasLevelId', enrollment.id)
        .whereNotIn('status', ['RENEGOTIATED'])

      const futurePaymentIdsToCancel = linkedPayments
        .filter(
          (payment) =>
            payment.dueDate >= startOfToday &&
            CANCELLABLE_PAYMENT_STATUSES.includes(
              payment.status as (typeof CANCELLABLE_PAYMENT_STATUSES)[number]
            )
        )
        .map((payment) => payment.id)

      if (futurePaymentIdsToCancel.length > 0) {
        await StudentPayment.query({ client: trx })
          .whereIn('id', futurePaymentIdsToCancel)
          .update({
            status: 'CANCELLED',
            metadata: {
              cancelReason: 'Matrícula cancelada',
              cancelledAt: now.toISO(),
            },
          })
      }

      enrollment.deletedAt = now
      await enrollment.useTransaction(trx).save()

      const fallbackEnrollment = await StudentHasLevel.query({ client: trx })
        .where('studentId', studentId)
        .whereNull('deletedAt')
        .whereHas('levelAssignedToCourseAcademicPeriod', (lacapQuery) => {
          lacapQuery.whereHas('courseHasAcademicPeriod', (chapQuery) => {
            chapQuery.whereHas('academicPeriod', (academicPeriodQuery) => {
              academicPeriodQuery.where('isActive', true).whereNull('deletedAt')
            })
          })
        })
        .orderBy('createdAt', 'desc')
        .first()

      const student = await Student.query({ client: trx }).where('id', studentId).first()
      if (!student) {
        throw AppException.notFound('Aluno não encontrado')
      }
      student.classId = fallbackEnrollment?.classId ?? null
      await student.useTransaction(trx).save()

      return linkedPayments.map((payment) => payment.id)
    })

    if (paymentIdsToReconcile.length > 0) {
      try {
        await getQueueManager()
        for (const paymentId of paymentIdsToReconcile) {
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId,
            triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
            source: 'students.enrollments.cancel',
          })
        }
      } catch (error) {
        console.error('[CANCEL_ENROLLMENT] Failed to dispatch reconcile jobs:', error)
      }
    }

    return response.ok({ success: true })
  }
}
