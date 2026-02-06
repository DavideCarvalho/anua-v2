import type { HttpContext } from '@adonisjs/core/http'
import type { Request } from '@adonisjs/core/http'
import type { Response } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Contract from '#models/contract'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import WalletTopUp from '#models/wallet_top_up'

type AsaasWebhookEvent =
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_UPDATED'

interface AsaasWebhookPayload {
  event: AsaasWebhookEvent
  payment: {
    id: string
    status: string
    billingType: string
    externalReference?: string
    paymentDate?: string
    confirmedDate?: string
    dueDate?: string
    invoiceUrl?: string
    bankSlipUrl?: string
  }
}

export default class AsaasWebhookController {
  async handle({ request, response }: HttpContext) {
    const payload = request.body() as AsaasWebhookPayload

    if (!payload?.event || !payload?.payment?.id) {
      return response.badRequest({ message: 'Payload inválido' })
    }

    if (!payload.payment.externalReference) {
      return response.badRequest({ message: 'External reference não informado' })
    }

    // Try StudentPayment first (existing behavior)
    const payment = await StudentPayment.find(payload.payment.externalReference)
    if (payment) {
      return this.handleStudentPayment(payment, payload, request, response)
    }

    // Try WalletTopUp
    const topUp = await WalletTopUp.find(payload.payment.externalReference)
    if (topUp) {
      return this.handleWalletTopUp(topUp, payload, request, response)
    }

    return response.notFound({ message: 'Pagamento não encontrado' })
  }

  private async handleStudentPayment(
    payment: StudentPayment,
    payload: AsaasWebhookPayload,
    request: Request,
    response: Response
  ) {
    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    const expectedToken =
      contract?.school?.asaasWebhookToken ?? contract?.school?.schoolChain?.asaasWebhookToken

    const webhookToken =
      request.header('x-asaas-webhook-token') ??
      request.header('asaas-webhook-token') ??
      request.header('asaas-token')

    if (expectedToken && webhookToken !== expectedToken) {
      return response.forbidden({ message: 'Token do webhook inválido' })
    }

    payment.paymentGateway = 'ASAAS'
    payment.paymentGatewayId = payload.payment.id
    payment.invoiceUrl =
      payload.payment.bankSlipUrl ?? payload.payment.invoiceUrl ?? payment.invoiceUrl

    switch (payload.event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        payment.status = 'PAID'
        const paidAt = payload.payment.confirmedDate ?? payload.payment.paymentDate
        payment.paidAt = paidAt ? DateTime.fromISO(paidAt) : DateTime.now()
        break
      }
      case 'PAYMENT_OVERDUE':
        payment.status = 'OVERDUE'
        break
      case 'PAYMENT_DELETED':
        payment.status = 'CANCELLED'
        break
      case 'PAYMENT_CREATED':
        payment.status = 'PENDING'
        break
      case 'PAYMENT_UPDATED':
        payment.status = payment.status ?? 'PENDING'
        break
      default:
        break
    }

    await payment.save()

    return response.ok({ success: true, paymentId: payment.id, event: payload.event })
  }

  private async handleWalletTopUp(
    topUp: WalletTopUp,
    payload: AsaasWebhookPayload,
    request: Request,
    response: Response
  ) {
    // Validate webhook token via student's school
    const studentHasLevel = await StudentHasLevel.query()
      .where('studentId', topUp.studentId)
      .whereNull('deletedAt')
      .preload('level', (q) => q.preload('school', (sq) => sq.preload('schoolChain')))
      .orderBy('createdAt', 'desc')
      .first()

    const school = studentHasLevel?.level?.school
    const expectedToken = school?.asaasWebhookToken ?? school?.schoolChain?.asaasWebhookToken

    const webhookToken =
      request.header('x-asaas-webhook-token') ??
      request.header('asaas-webhook-token') ??
      request.header('asaas-token')

    if (expectedToken && webhookToken !== expectedToken) {
      return response.forbidden({ message: 'Token do webhook inválido' })
    }

    switch (payload.event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        if (topUp.status === 'PAID') {
          return response.ok({ success: true, topUpId: topUp.id, event: payload.event })
        }

        await db.transaction(async (trx) => {
          const student = await Student.query({ client: trx })
            .where('id', topUp.studentId)
            .forUpdate()
            .firstOrFail()

          const previousBalance = student.balance ?? 0
          const newBalance = previousBalance + topUp.amount

          student.balance = newBalance
          await student.save()

          await StudentBalanceTransaction.create(
            {
              studentId: topUp.studentId,
              amount: topUp.amount,
              type: 'TOP_UP',
              status: 'COMPLETED',
              description: `Recarga via ${topUp.paymentMethod ?? 'ASAAS'}`,
              previousBalance,
              newBalance,
              responsibleId: topUp.responsibleUserId,
              paymentGatewayId: payload.payment.id,
              paymentMethod: topUp.paymentMethod,
            },
            { client: trx }
          )

          topUp.useTransaction(trx)
          topUp.status = 'PAID'
          const paidAt = payload.payment.confirmedDate ?? payload.payment.paymentDate
          topUp.paidAt = paidAt ? DateTime.fromISO(paidAt) : DateTime.now()
          topUp.paymentGatewayId = payload.payment.id
          await topUp.save()
        })

        break
      }
      case 'PAYMENT_OVERDUE':
        topUp.status = 'FAILED'
        await topUp.save()
        break
      case 'PAYMENT_DELETED':
        topUp.status = 'CANCELLED'
        await topUp.save()
        break
      case 'PAYMENT_CREATED':
      case 'PAYMENT_UPDATED':
        break
      default:
        break
    }

    return response.ok({ success: true, topUpId: topUp.id, event: payload.event })
  }
}
