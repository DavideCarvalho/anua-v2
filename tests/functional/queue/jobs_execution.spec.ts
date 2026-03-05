import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import WebhookEvent from '#models/webhook_event'
import ProcessAsaasPaymentWebhookJob from '#jobs/asaas/process_asaas_payment_webhook_job'

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

test.group('Queue job execution', (group) => {
  group.each.setup(async () => {
    await db.rawQuery(`
      CREATE TABLE IF NOT EXISTS "WebhookEvent" (
        "id" text PRIMARY KEY,
        "eventId" text NOT NULL UNIQUE,
        "provider" text NOT NULL,
        "eventType" text NOT NULL,
        "payload" jsonb NOT NULL,
        "status" text NOT NULL DEFAULT 'PENDING',
        "processedAt" timestamp NULL,
        "error" text NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT NOW(),
        "updatedAt" timestamp NOT NULL
      )
    `)

    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('ignores missing webhook event without throwing', async ({ assert }) => {
    await ProcessAsaasPaymentWebhookJob.dispatch({
      webhookEventId: uniqueId('missing-webhook'),
    }).with('sync')

    assert.isTrue(true)
  })

  test('marks webhook as FAILED when related payment does not exist', async ({ assert }) => {
    const event = await WebhookEvent.create({
      eventId: uniqueId('asaas-event'),
      provider: 'ASAAS',
      eventType: 'PAYMENT_RECEIVED',
      status: 'PENDING',
      attempts: 0,
      error: null,
      processedAt: null,
      payload: {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: uniqueId('gateway-payment'),
          status: 'RECEIVED',
          billingType: 'BOLETO',
          externalReference: uniqueId('missing-student-payment'),
        },
      },
    })

    await assert.rejects(
      () => ProcessAsaasPaymentWebhookJob.dispatch({ webhookEventId: event.id }).with('sync'),
      /studentpayment|row not found/i
    )

    await event.refresh()

    assert.equal(event.status, 'FAILED')
    assert.equal(event.attempts, 1)
    assert.isString(event.error)
  })
})
