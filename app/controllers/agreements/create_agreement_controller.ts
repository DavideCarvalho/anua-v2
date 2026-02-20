import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Agreement from '#models/agreement'
import AgreementEarlyDiscount from '#models/agreement_early_discount'
import Invoice from '#models/invoice'
import StudentPayment from '#models/student_payment'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import { getQueueManager } from '#services/queue_service'
import { createAgreementValidator } from '#validators/agreement'
import AppException from '#exceptions/app_exception'

export default class CreateAgreementController {
  async handle(ctx: HttpContext) {
    const { request, response } = ctx
    const user = ctx.auth?.user
    const payload = await request.validateUsing(createAgreementValidator)

    const invoices = await Invoice.query()
      .whereIn('id', payload.invoiceIds)
      .whereIn('status', ['OPEN', 'PENDING', 'OVERDUE'])
      .preload('payments')
      .preload('student')

    if (invoices.length === 0) {
      throw AppException.badRequest('Nenhuma fatura válida selecionada')
    }

    if (invoices.length !== payload.invoiceIds.length) {
      throw AppException.badRequest(
        'Algumas faturas não foram encontradas ou já estão pagas/canceladas'
      )
    }

    const studentIds = new Set(invoices.map((i) => i.studentId))
    if (studentIds.size > 1) {
      throw AppException.badRequest('Todas as faturas devem pertencer ao mesmo aluno')
    }

    const studentId = invoices[0].studentId
    // Get contractId from first invoice that has one (may be undefined for aggregated invoices)
    const contractId = invoices.find((i) => i.contractId)?.contractId ?? undefined

    const startDate = DateTime.fromJSDate(payload.startDate)

    const baseTotalAmount = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)

    const hasRenegotiationDiscount =
      payload.renegotiationDiscountType !== undefined &&
      payload.renegotiationDiscountType !== null &&
      payload.renegotiationDiscountValue !== undefined &&
      payload.renegotiationDiscountValue !== null

    if (
      (payload.renegotiationDiscountType && !payload.renegotiationDiscountValue) ||
      (!payload.renegotiationDiscountType && payload.renegotiationDiscountValue)
    ) {
      throw AppException.badRequest('Informe tipo e valor para aplicar desconto da renegociação')
    }

    let renegotiationDiscountAmount = 0
    if (hasRenegotiationDiscount) {
      if (payload.renegotiationDiscountType === 'PERCENTAGE') {
        renegotiationDiscountAmount = Math.round(
          (baseTotalAmount * Number(payload.renegotiationDiscountValue ?? 0)) / 100
        )
      } else {
        renegotiationDiscountAmount = Number(payload.renegotiationDiscountValue ?? 0)
      }
    }

    renegotiationDiscountAmount = Math.max(
      0,
      Math.min(baseTotalAmount, Math.round(renegotiationDiscountAmount))
    )

    const totalAmount = baseTotalAmount - renegotiationDiscountAmount
    const baseInstallmentAmount = Math.floor(totalAmount / payload.installments)
    const installmentRemainder = totalAmount % payload.installments

    const normalizedEarlyDiscounts = (payload.earlyDiscounts ?? []).map((discount) => {
      if (discount.discountType === 'PERCENTAGE') {
        if (!discount.percentage) {
          throw AppException.badRequest('Desconto percentual deve informar a porcentagem')
        }

        return {
          discountType: 'PERCENTAGE' as const,
          percentage: discount.percentage,
          flatAmount: null,
          daysBeforeDeadline: discount.daysBeforeDeadline,
        }
      }

      if (!discount.flatAmount) {
        throw AppException.badRequest('Desconto em valor fixo deve informar o valor')
      }

      return {
        discountType: 'FLAT' as const,
        percentage: null,
        flatAmount: discount.flatAmount,
        daysBeforeDeadline: discount.daysBeforeDeadline,
      }
    })

    const trx = await db.transaction()
    const affectedPaymentIds = new Set<string>()

    try {
      const agreement = await Agreement.create(
        {
          totalAmount,
          installments: payload.installments,
          startDate: DateTime.fromJSDate(payload.startDate),
          paymentDay: payload.paymentDay,
          paymentMethod: payload.paymentMethod ?? null,
          billingType: 'UPFRONT',
          finePercentage: Number(payload.finePercentage ?? 0),
          dailyInterestPercentage: Number(payload.dailyInterestPercentage ?? 0),
        },
        { client: trx }
      )

      if (normalizedEarlyDiscounts.length > 0) {
        for (const discount of normalizedEarlyDiscounts) {
          await AgreementEarlyDiscount.create(
            {
              agreementId: agreement.id,
              discountType: discount.discountType,
              percentage: discount.percentage,
              flatAmount: discount.flatAmount,
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
          affectedPaymentIds.add(payment.id)
        }
      }

      // Generate new invoices with agreement payments
      const discountReferenceAmount = Math.ceil(totalAmount / payload.installments)
      const bestDiscount = normalizedEarlyDiscounts.reduce<{
        discountType: 'PERCENTAGE' | 'FLAT'
        discountPercentage: number
        discountValue: number
      } | null>((best, discount) => {
        const discountValueForComparison =
          discount.discountType === 'PERCENTAGE'
            ? Math.round((discountReferenceAmount * (discount.percentage ?? 0)) / 100)
            : (discount.flatAmount ?? 0)

        const cappedDiscountValue = Math.max(
          0,
          Math.min(discountReferenceAmount, discountValueForComparison)
        )
        const candidate = {
          discountType: discount.discountType,
          discountPercentage:
            discount.discountType === 'PERCENTAGE' ? (discount.percentage ?? 0) : 0,
          discountValue: discount.discountType === 'FLAT' ? (discount.flatAmount ?? 0) : 0,
        }

        if (!best) return candidate

        const bestValueForComparison =
          best.discountType === 'PERCENTAGE'
            ? Math.round((discountReferenceAmount * best.discountPercentage) / 100)
            : best.discountValue
        const cappedBestValue = Math.max(
          0,
          Math.min(discountReferenceAmount, bestValueForComparison)
        )

        return cappedDiscountValue > cappedBestValue ? candidate : best
      }, null)

      for (let i = 0; i < payload.installments; i++) {
        const installmentAmount = baseInstallmentAmount + (i < installmentRemainder ? 1 : 0)
        const dueDate = startDate.plus({ months: i }).set({ day: payload.paymentDay })

        let invoiceForPeriod = await Invoice.query({ client: trx })
          .where('studentId', studentId)
          .where('month', dueDate.month)
          .where('year', dueDate.year)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
          .first()

        if (!invoiceForPeriod) {
          invoiceForPeriod = await Invoice.create(
            {
              studentId,
              contractId: null,
              type: 'MONTHLY',
              month: dueDate.month,
              year: dueDate.year,
              dueDate,
              status: 'OPEN',
              totalAmount: 0,
            },
            { client: trx }
          )
        }

        const createdPayment = await StudentPayment.create(
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
            discountType: bestDiscount?.discountType ?? 'PERCENTAGE',
            discountPercentage:
              bestDiscount?.discountType === 'PERCENTAGE' ? bestDiscount.discountPercentage : 0,
            discountValue: bestDiscount?.discountType === 'FLAT' ? bestDiscount.discountValue : 0,
            contractId,
            agreementId: agreement.id,
            invoiceId: invoiceForPeriod.id,
            metadata: {
              renegotiationDiscountType: payload.renegotiationDiscountType ?? null,
              renegotiationDiscountValue: payload.renegotiationDiscountValue ?? null,
              renegotiationDiscountAmount,
              baseTotalAmount,
            },
          },
          { client: trx }
        )

        affectedPaymentIds.add(createdPayment.id)

        const linkedPayments = await StudentPayment.query({ client: trx })
          .where('invoiceId', invoiceForPeriod.id)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

        invoiceForPeriod.totalAmount = linkedPayments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        )
        await invoiceForPeriod.useTransaction(trx).save()
      }

      await trx.commit()

      if (affectedPaymentIds.size > 0) {
        try {
          await getQueueManager()

          for (const paymentId of affectedPaymentIds) {
            await ReconcilePaymentInvoiceJob.dispatch({
              paymentId,
              triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
              source: 'agreements.create',
            })
          }
        } catch (error) {
          console.error('[CREATE_AGREEMENT] Failed to dispatch reconcile jobs:', error)
        }
      }

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
