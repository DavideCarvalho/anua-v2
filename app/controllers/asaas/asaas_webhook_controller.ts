import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Contract from '#models/contract'
import StudentPayment from '#models/student_payment'

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

    const payment = await StudentPayment.find(payload.payment.externalReference)
    if (!payment) {
      return response.notFound({ message: 'Pagamento não encontrado' })
    }

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

    return response.ok({
      success: true,
      paymentId: payment.id,
      event: payload.event,
    })
  }
}
