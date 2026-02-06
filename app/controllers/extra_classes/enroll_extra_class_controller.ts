import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ExtraClass from '#models/extra_class'
import StudentHasExtraClass from '#models/student_has_extra_class'
import StudentPayment from '#models/student_payment'
import AcademicPeriod from '#models/academic_period'
import Contract from '#models/contract'
import Scholarship from '#models/scholarship'
import { enrollExtraClassValidator } from '#validators/extra_class'
import { getQueueManager } from '#services/queue_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'

export default class EnrollExtraClassController {
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx
    const data = await request.validateUsing(enrollExtraClassValidator)

    const extraClass = await ExtraClass.find(params.id)
    if (!extraClass || !extraClass.isActive) {
      return response.notFound({ message: 'Aula avulsa não encontrada' })
    }

    // Check capacity
    if (extraClass.maxStudents) {
      const enrolledCount = await StudentHasExtraClass.query()
        .where('extraClassId', extraClass.id)
        .whereNull('cancelledAt')
        .count('* as total')

      const total = Number(enrolledCount[0].$extras.total)
      if (total >= extraClass.maxStudents) {
        return response.conflict({ message: 'Vagas esgotadas para esta aula avulsa' })
      }
    }

    // Check if already enrolled
    const existing = await StudentHasExtraClass.query()
      .where('extraClassId', extraClass.id)
      .where('studentId', data.studentId)
      .whereNull('cancelledAt')
      .first()

    if (existing) {
      return response.conflict({ message: 'Aluno já está inscrito nesta aula avulsa' })
    }

    const contractId = data.contractId ?? extraClass.contractId
    const contract = await Contract.findOrFail(contractId)
    const scholarship = data.scholarshipId ? await Scholarship.find(data.scholarshipId) : null
    const academicPeriod = await AcademicPeriod.findOrFail(extraClass.academicPeriodId)

    const trx = await db.transaction()

    try {
      const enrollment = await StudentHasExtraClass.create(
        {
          studentId: data.studentId,
          extraClassId: extraClass.id,
          contractId,
          scholarshipId: data.scholarshipId ?? null,
          paymentMethod: data.paymentMethod,
          paymentDay: data.paymentDay,
          enrolledAt: DateTime.now(),
        },
        { client: trx }
      )

      // Generate payments for remaining months
      const now = DateTime.now()
      const endDate = DateTime.fromJSDate(new Date(String(academicPeriod.endDate)))
      const discountPercentage = scholarship?.discountPercentage ?? 0
      const monthlyAmount = contract.ammount
      const discountedAmount = Math.round(monthlyAmount * (1 - discountPercentage / 100))

      let current = now.startOf('month')
      const end = endDate.startOf('month')
      const payments: StudentPayment[] = []

      while (current <= end) {
        const dueDate = current.set({ day: Math.min(data.paymentDay, 28) })

        const payment = await StudentPayment.create(
          {
            studentId: data.studentId,
            contractId,
            studentHasExtraClassId: enrollment.id,
            type: 'EXTRA_CLASS',
            amount: discountedAmount,
            totalAmount: monthlyAmount,
            month: current.month,
            year: current.year,
            dueDate,
            installments: 1,
            installmentNumber: 1,
            status: 'PENDING',
            discountPercentage,
          },
          { client: trx }
        )

        payments.push(payment)
        current = current.plus({ months: 1 })
      }

      await trx.commit()

      // Reconcile invoices
      try {
        await getQueueManager()
        const user = ctx.auth?.user
        for (const payment of payments) {
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId: payment.id,
            triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
            source: 'extra-classes.enroll',
          })
        }
      } catch (error) {
        console.error('[ENROLL_EXTRA_CLASS] Failed to dispatch reconcile jobs:', error)
      }

      await enrollment.load('student', (q) => q.preload('user'))
      await enrollment.load('extraClass')

      return response.created(enrollment)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
