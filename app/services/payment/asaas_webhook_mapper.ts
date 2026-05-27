import type { PaymentWebhookEvent, PaymentEventType } from './payment_webhook_types.js'

interface AsaasPaymentPayload {
  event: string
  payment?: {
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

const EVENT_MAP: Record<string, PaymentEventType> = {
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_RECEIVED: 'PAYMENT_CONFIRMED',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
  PAYMENT_DELETED: 'PAYMENT_DELETED',
  PAYMENT_UPDATED: 'PAYMENT_UPDATED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_CHARGEBACK_REQUESTED: 'PAYMENT_CHARGEBACK',
}

export default class AsaasWebhookMapper {
  static toPaymentEvent(payload: AsaasPaymentPayload): PaymentWebhookEvent | null {
    const mapped = EVENT_MAP[payload.event]
    if (!mapped || !payload.payment) return null

    return {
      eventType: mapped,
      gatewayChargeId: payload.payment.id,
      externalReference: payload.payment.externalReference ?? '',
      paidAt: payload.payment.confirmedDate ?? payload.payment.paymentDate ?? null,
      invoiceUrl: payload.payment.invoiceUrl ?? null,
      bankSlipUrl: payload.payment.bankSlipUrl ?? null,
    }
  }
}
