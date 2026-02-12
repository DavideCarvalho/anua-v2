import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import Invoice from '#models/invoice'
import AppException from '#exceptions/app_exception'

export default class DestroyStudentController {
  async handle({ params, request, response }: HttpContext) {
    const studentId = params.id
    const academicPeriodId = request.input('academicPeriodId')

    const student = await Student.find(studentId)
    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    // Soft delete StudentHasLevel records
    const levelQuery = StudentHasLevel.query().where('studentId', studentId).whereNull('deletedAt')

    if (academicPeriodId) {
      levelQuery.where('academicPeriodId', academicPeriodId)
    }

    const studentLevels = await levelQuery

    if (studentLevels.length === 0) {
      throw AppException.notFound('Nenhuma matrícula ativa encontrada')
    }

    const now = DateTime.now()
    const currentMonth = now.month
    const currentYear = now.year

    const trx = await db.transaction()

    try {
      // Soft delete all matching StudentHasLevel records
      for (const studentLevel of studentLevels) {
        studentLevel.useTransaction(trx)
        studentLevel.deletedAt = now
        await studentLevel.save()
      }

      // Consolidate unpaid future payments into current month
      const unpaidFuturePayments = await StudentPayment.query({ client: trx })
        .where('studentId', studentId)
        .whereIn('status', ['NOT_PAID', 'PENDING', 'OVERDUE'])
        .where((q) => {
          q.where('year', '>', currentYear).orWhere((sub) => {
            sub.where('year', currentYear).where('month', '>', currentMonth)
          })
        })

      if (unpaidFuturePayments.length > 0) {
        const affectedInvoiceIds = new Set<string>()

        for (const payment of unpaidFuturePayments) {
          if (payment.invoiceId) {
            affectedInvoiceIds.add(payment.invoiceId)
          }
          payment.useTransaction(trx)
          payment.month = currentMonth
          payment.year = currentYear
          payment.invoiceId = null
          await payment.save()
        }

        // Recalculate or cancel invoices that lost payments
        for (const invoiceId of affectedInvoiceIds) {
          const invoice = await Invoice.query({ client: trx })
            .where('id', invoiceId)
            .whereNotIn('status', ['PAID', 'CANCELLED'])
            .first()

          if (!invoice) continue

          const remainingPayments = await StudentPayment.query({ client: trx })
            .where('invoiceId', invoiceId)
            .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

          if (remainingPayments.length === 0) {
            invoice.useTransaction(trx)
            invoice.status = 'CANCELLED'
            await invoice.save()
          } else {
            const newTotal = remainingPayments.reduce((sum, p) => sum + Number(p.amount), 0)
            invoice.useTransaction(trx)
            invoice.totalAmount = newTotal
            await invoice.save()
          }
        }

        logger.info(
          `[STUDENT_DELETE] Consolidated ${unpaidFuturePayments.length} future payments to ${currentMonth}/${currentYear} for student ${studentId}`
        )
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      logger.error(`[STUDENT_DELETE] Error deleting student ${studentId}:`, {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }

    return response.noContent()
  }
}
