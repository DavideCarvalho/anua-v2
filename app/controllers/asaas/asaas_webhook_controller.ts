import type { HttpContext } from '@adonisjs/core/http'
import type { Request } from '@adonisjs/core/http'
import type { Response } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { timingSafeEqual } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import Contract from '#models/contract'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import WalletTopUp from '#models/wallet_top_up'
import AppException from '#exceptions/app_exception'

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
    const webhookToken = this.getWebhookToken(request)

    if (!webhookToken) {
      throw AppException.invalidWebhookToken()
    }

    if (!payload?.event || !payload?.payment?.id) {
      throw AppException.invalidWebhookPayload()
    }

    if (!payload.payment.externalReference) {
      throw AppException.missingExternalReference()
    }

    // Try StudentPayment first (existing behavior)
    const payment = await StudentPayment.find(payload.payment.externalReference)
    if (payment) {
      return this.handleStudentPayment(payment, payload, webhookToken, response)
    }

    // Try WalletTopUp
    const topUp = await WalletTopUp.find(payload.payment.externalReference)
    if (topUp) {
      return this.handleWalletTopUp(topUp, payload, webhookToken, response)
    }

    throw AppException.notFound('Pagamento nao encontrado')
  }

  private async handleStudentPayment(
    payment: StudentPayment,
    payload: AsaasWebhookPayload,
    webhookToken: string,
    response: Response
  ) {
    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    const expectedToken =
      contract?.school?.asaasWebhookToken ??
      contract?.school?.schoolChain?.asaasWebhookToken ??
      null

    if (!this.isWebhookTokenValid(expectedToken, webhookToken)) {
      throw AppException.invalidWebhookToken()
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
    webhookToken: string,
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
    const expectedToken =
      school?.asaasWebhookToken ?? school?.schoolChain?.asaasWebhookToken ?? null

    if (!this.isWebhookTokenValid(expectedToken, webhookToken)) {
      throw AppException.invalidWebhookToken()
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

  private getWebhookToken(request: Request): string | null {
    const token = request.header('x-asaas-webhook-token')
    return token?.trim() || null
  }

  private isWebhookTokenValid(expectedToken: string | null, receivedToken: string): boolean {
    if (!expectedToken) {
      return false
    }

    const expected = Buffer.from(expectedToken)
    const received = Buffer.from(receivedToken)

    if (expected.length !== received.length) {
      return false
    }

    return timingSafeEqual(expected, received)
  }
}
