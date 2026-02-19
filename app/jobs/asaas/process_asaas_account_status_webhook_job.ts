import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'
import type { PaymentConfigStatus } from '#models/school'
import WebhookEvent from '#models/webhook_event'

type AsaasAccountStatusEvent =
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_APPROVED'
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_PENDING'
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_REJECTED'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRING_SOON'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRED'
  | 'ACCOUNT_STATUS_DOCUMENT_APPROVED'
  | 'ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_DOCUMENT_PENDING'
  | 'ACCOUNT_STATUS_DOCUMENT_REJECTED'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_PENDING'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED'

const STATUS_MAP: Partial<Record<AsaasAccountStatusEvent, PaymentConfigStatus>> = {
  // General approval — the definitive account status
  ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED: 'ACTIVE',
  ACCOUNT_STATUS_GENERAL_APPROVAL_AWAITING_APPROVAL: 'PENDING_APPROVAL',
  ACCOUNT_STATUS_GENERAL_APPROVAL_PENDING: 'PENDING_APPROVAL',
  ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED: 'REJECTED',
  // Documents
  ACCOUNT_STATUS_DOCUMENT_APPROVED: 'PENDING_APPROVAL',
  ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL: 'PENDING_APPROVAL',
  ACCOUNT_STATUS_DOCUMENT_PENDING: 'PENDING_DOCUMENTS',
  ACCOUNT_STATUS_DOCUMENT_REJECTED: 'REJECTED',
  // Commercial info
  ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED: 'ACTIVE',
  ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL: 'PENDING_APPROVAL',
  ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING: 'PENDING_DOCUMENTS',
  ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED: 'REJECTED',
  ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRING_SOON: 'EXPIRING_SOON',
  ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRED: 'EXPIRED',
  // Bank account — informational, don't change overall status
}

interface ProcessAsaasAccountStatusWebhookPayload {
  webhookEventId: string
}

export default class ProcessAsaasAccountStatusWebhookJob extends Job<ProcessAsaasAccountStatusWebhookPayload> {
  static readonly jobName = 'ProcessAsaasAccountStatusWebhookJob'

  static options = {
    queue: 'payments',
    maxRetries: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { webhookEventId } = this.payload

    const webhookEvent = await WebhookEvent.find(webhookEventId)
    if (!webhookEvent) {
      console.warn(`[ASAAS_WEBHOOK] WebhookEvent ${webhookEventId} not found - skipping`)
      return
    }

    if (webhookEvent.status === 'COMPLETED') {
      console.log(`[ASAAS_WEBHOOK] WebhookEvent ${webhookEventId} already completed - skipping`)
      return
    }

    const payload = webhookEvent.payload as {
      event: AsaasAccountStatusEvent
      account: { id: string }
    }

    try {
      webhookEvent.status = 'PROCESSING'
      webhookEvent.attempts += 1
      await webhookEvent.save()

      await db.transaction(async (trx) => {
        const school = await School.query({ client: trx })
          .where('asaasAccountId', payload.account.id)
          .forUpdate()
          .firstOrFail()

        const newStatus = STATUS_MAP[payload.event]
        if (newStatus) {
          school.paymentConfigStatus = newStatus
          school.paymentConfigStatusUpdatedAt = DateTime.now()
        }

        // Track commercial info expiration separately
        if (payload.event === 'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRED') {
          school.asaasCommercialInfoIsExpired = true
        } else if (
          payload.event === 'ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED' ||
          payload.event === 'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRING_SOON'
        ) {
          school.asaasCommercialInfoIsExpired = false
        }

        await school.save()

        webhookEvent.useTransaction(trx)
        webhookEvent.status = 'COMPLETED'
        webhookEvent.processedAt = DateTime.now()
        webhookEvent.error = null
        await webhookEvent.save()
      })

      console.log(`[ASAAS_WEBHOOK] Account status webhook processed: ${webhookEventId}`)
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : String(error)
      await webhookEvent.save()
      throw error
    }
  }
}
