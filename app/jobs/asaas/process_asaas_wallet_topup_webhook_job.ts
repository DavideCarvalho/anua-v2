import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Student from '#models/student'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import WalletTopUp from '#models/wallet_top_up'
import WebhookEvent from '#models/webhook_event'

interface ProcessAsaasWalletTopUpWebhookPayload {
  webhookEventId: string
}

export default class ProcessAsaasWalletTopUpWebhookJob extends Job<ProcessAsaasWalletTopUpWebhookPayload> {
  static readonly jobName = 'ProcessAsaasWalletTopUpWebhookJob'

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
      event: string
      payment: {
        id: string
        externalReference: string
        paymentDate?: string
        confirmedDate?: string
      }
    }

    try {
      webhookEvent.status = 'PROCESSING'
      webhookEvent.attempts += 1
      await webhookEvent.save()

      await db.transaction(async (trx) => {
        const topUp = await WalletTopUp.query({ client: trx })
          .where('id', payload.payment.externalReference)
          .forUpdate()
          .firstOrFail()

        switch (payload.event) {
          case 'PAYMENT_CONFIRMED':
          case 'PAYMENT_RECEIVED': {
            if (topUp.status === 'PAID') {
              // Already processed — mark webhook as completed and return
              webhookEvent.useTransaction(trx)
              webhookEvent.status = 'COMPLETED'
              webhookEvent.processedAt = DateTime.now()
              webhookEvent.error = null
              await webhookEvent.save()
              return
            }

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

            topUp.status = 'PAID'
            const paidAt = payload.payment.confirmedDate ?? payload.payment.paymentDate
            topUp.paidAt = paidAt ? DateTime.fromISO(paidAt) : DateTime.now()
            topUp.paymentGatewayId = payload.payment.id
            await topUp.save()
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
          case 'PAYMENT_REFUNDED':
          case 'PAYMENT_CHARGEBACK_REQUESTED':
            topUp.status = 'CANCELLED'
            await topUp.save()
            break
          default:
            break
        }

        webhookEvent.useTransaction(trx)
        webhookEvent.status = 'COMPLETED'
        webhookEvent.processedAt = DateTime.now()
        webhookEvent.error = null
        await webhookEvent.save()
      })

      console.log(`[ASAAS_WEBHOOK] WalletTopUp webhook processed: ${webhookEventId}`)
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : String(error)
      await webhookEvent.save()
      throw error
    }
  }
}
