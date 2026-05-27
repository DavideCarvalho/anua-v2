export type PaymentEventType =
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_CHARGEBACK'

export interface PaymentWebhookEvent {
  eventType: PaymentEventType
  gatewayChargeId: string
  externalReference: string
  paidAt: string | null
  invoiceUrl: string | null
  bankSlipUrl: string | null
}
