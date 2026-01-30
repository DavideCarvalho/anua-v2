import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Agreement from '#models/agreement'
import AgreementEarlyDiscount from '#models/agreement_early_discount'
import StudentPayment from '#models/student_payment'
import { createAgreementValidator } from '#validators/agreement'

export default class CreateAgreementController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAgreementValidator)

    const payments = await StudentPayment.query()
      .whereIn('id', payload.paymentIds)
      .whereIn('status', ['NOT_PAID', 'PENDING', 'OVERDUE'])
      .preload('student')

    if (payments.length === 0) {
      return response.badRequest({ message: 'Nenhum pagamento válido selecionado' })
    }

    if (payments.length !== payload.paymentIds.length) {
      return response.badRequest({
        message: 'Alguns pagamentos não foram encontrados ou já estão pagos/cancelados',
      })
    }

    const studentIds = new Set(payments.map((p) => p.studentId))
    if (studentIds.size > 1) {
      return response.badRequest({
        message: 'Todos os pagamentos devem pertencer ao mesmo aluno',
      })
    }

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const studentId = payments[0].studentId
    const contractId = payments[0].contractId
    const installmentAmount = Math.round(totalAmount / payload.installments)

    const trx = await db.transaction()

    try {
      const agreement = await Agreement.create(
        {
          totalAmount,
          installments: payload.installments,
          startDate: DateTime.fromJSDate(payload.startDate),
          paymentDay: payload.paymentDay,
        },
        { client: trx }
      )

      if (payload.earlyDiscounts && payload.earlyDiscounts.length > 0) {
        for (const discount of payload.earlyDiscounts) {
          await AgreementEarlyDiscount.create(
            {
              agreementId: agreement.id,
              percentage: discount.percentage,
              daysBeforeDeadline: discount.daysBeforeDeadline,
            },
            { client: trx }
          )
        }
      }

      for (const payment of payments) {
        payment.useTransaction(trx)
        payment.status = 'CANCELLED'
        payment.metadata = {
          ...(payment.metadata || {}),
          cancelReason: 'Substituído por acordo',
          agreementId: agreement.id,
        }
        await payment.save()
      }

      const startDate = DateTime.fromJSDate(payload.startDate)
      for (let i = 0; i < payload.installments; i++) {
        const dueDate = startDate.plus({ months: i }).set({ day: payload.paymentDay })
        await StudentPayment.create(
          {
            studentId,
            amount: installmentAmount,
            totalAmount: installmentAmount,
            month: dueDate.month,
            year: dueDate.year,
            type: 'AGREEMENT',
            status: 'PENDING',
            dueDate,
            installments: payload.installments,
            installmentNumber: i + 1,
            discountPercentage: 0,
            contractId,
            agreementId: agreement.id,
          },
          { client: trx }
        )
      }

      await trx.commit()
      await agreement.load('earlyDiscounts')

      return response.created({
        agreement,
        cancelledPayments: payments.length,
        newPayments: payload.installments,
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
