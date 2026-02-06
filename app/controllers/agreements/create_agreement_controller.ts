import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Agreement from '#models/agreement'
import AgreementEarlyDiscount from '#models/agreement_early_discount'
import Invoice from '#models/invoice'
import StudentPayment from '#models/student_payment'
import { createAgreementValidator } from '#validators/agreement'

export default class CreateAgreementController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAgreementValidator)

    const invoices = await Invoice.query()
      .whereIn('id', payload.invoiceIds)
      .whereIn('status', ['OPEN', 'PENDING', 'OVERDUE'])
      .preload('payments')
      .preload('student')

    if (invoices.length === 0) {
      return response.badRequest({ message: 'Nenhuma fatura válida selecionada' })
    }

    if (invoices.length !== payload.invoiceIds.length) {
      return response.badRequest({
        message: 'Algumas faturas não foram encontradas ou já estão pagas/canceladas',
      })
    }

    const studentIds = new Set(invoices.map((i) => i.studentId))
    if (studentIds.size > 1) {
      return response.badRequest({
        message: 'Todas as faturas devem pertencer ao mesmo aluno',
      })
    }

    const totalAmount = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)
    const studentId = invoices[0].studentId
    // Get contractId from first invoice that has one (may be null for aggregated invoices)
    const contractId = invoices.find((i) => i.contractId)?.contractId ?? null
    const installmentAmount = Math.round(totalAmount / payload.installments)

    const trx = await db.transaction()

    try {
      const agreement = await Agreement.create(
        {
          totalAmount,
          installments: payload.installments,
          startDate: DateTime.fromJSDate(payload.startDate),
          paymentDay: payload.paymentDay,
          paymentMethod: payload.paymentMethod ?? null,
          billingType: payload.billingType ?? 'UPFRONT',
          finePercentage: payload.finePercentage ?? 0,
          dailyInterestPercentage: payload.dailyInterestPercentage ?? 0,
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

      // Mark original invoices and their payments as renegotiated
      for (const invoice of invoices) {
        invoice.useTransaction(trx)
        invoice.status = 'RENEGOTIATED'
        await invoice.save()

        for (const payment of invoice.payments) {
          payment.useTransaction(trx)
          payment.status = 'RENEGOTIATED'
          payment.metadata = {
            ...(payment.metadata || {}),
            renegotiatedReason: 'Substituído por acordo',
            agreementId: agreement.id,
          }
          await payment.save()
        }
      }

      // Generate new invoices with agreement payments
      const startDate = DateTime.fromJSDate(payload.startDate)

      for (let i = 0; i < payload.installments; i++) {
        const dueDate = startDate.plus({ months: i }).set({ day: payload.paymentDay })

        const newInvoice = await Invoice.create(
          {
            studentId,
            contractId,
            type: 'MONTHLY',
            month: dueDate.month,
            year: dueDate.year,
            dueDate,
            status: 'OPEN',
            totalAmount: installmentAmount,
          },
          { client: trx }
        )

        await StudentPayment.create(
          {
            studentId,
            amount: installmentAmount,
            totalAmount: installmentAmount,
            month: dueDate.month,
            year: dueDate.year,
            type: 'AGREEMENT',
            status: 'NOT_PAID',
            dueDate,
            installments: payload.installments,
            installmentNumber: i + 1,
            discountPercentage: 0,
            contractId,
            agreementId: agreement.id,
            invoiceId: newInvoice.id,
          },
          { client: trx }
        )
      }

      await trx.commit()
      await agreement.load('earlyDiscounts')

      return response.created({
        agreement,
        cancelledInvoices: invoices.length,
        newInvoices: payload.installments,
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
