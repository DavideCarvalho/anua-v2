import type { AsaasWebhookPayload } from './asaas_service.js'

export function buildAsaasSubaccountWebhooks(
  webhookUrl: string,
  schoolWebhookToken: string,
  platformWebhookToken: string,
  notificationEmail: string
): AsaasWebhookPayload[] {
  return [
    {
      name: 'Webhook de cobranças',
      url: webhookUrl,
      email: notificationEmail,
      sendType: 'SEQUENTIALLY',
      interrupted: false,
      enabled: true,
      apiVersion: 3,
      authToken: schoolWebhookToken,
      events: [
        'PAYMENT_CREATED',
        'PAYMENT_UPDATED',
        'PAYMENT_CONFIRMED',
        'PAYMENT_RECEIVED',
        'PAYMENT_OVERDUE',
        'PAYMENT_DELETED',
        'PAYMENT_REFUNDED',
        'PAYMENT_CHARGEBACK_REQUESTED',
        // NFS-e events
        'INVOICE_AUTHORIZED',
        'INVOICE_PROCESSING_CANCELLATION',
        'INVOICE_CANCELED',
        'INVOICE_CANCELLATION_DENIED',
        'INVOICE_ERROR',
      ],
    },
    {
      name: 'Webhook de status da conta',
      url: webhookUrl,
      email: notificationEmail,
      sendType: 'SEQUENTIALLY',
      interrupted: false,
      enabled: true,
      apiVersion: 3,
      authToken: platformWebhookToken,
      events: [
        // Bank account
        'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_APPROVED',
        'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_AWAITING_APPROVAL',
        'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_PENDING',
        'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_REJECTED',
        // Commercial info
        'ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED',
        'ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL',
        'ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING',
        'ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED',
        'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRING_SOON',
        'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRED',
        // Documents
        'ACCOUNT_STATUS_DOCUMENT_APPROVED',
        'ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL',
        'ACCOUNT_STATUS_DOCUMENT_PENDING',
        'ACCOUNT_STATUS_DOCUMENT_REJECTED',
        // General approval
        'ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED',
        'ACCOUNT_STATUS_GENERAL_APPROVAL_AWAITING_APPROVAL',
        'ACCOUNT_STATUS_GENERAL_APPROVAL_PENDING',
        'ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED',
      ],
    },
  ]
}
