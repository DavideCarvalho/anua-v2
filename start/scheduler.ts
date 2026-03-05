import scheduler from 'adonisjs-scheduler/services/main'
import GenerateMissingPaymentsJob from '#jobs/payments/generate_missing_payments_job'
import GenerateInvoicesJob from '#jobs/payments/generate_invoices_job'
import RefreshOverdueInvoicesJob from '#jobs/payments/refresh_overdue_invoices_job'
import CreateInvoiceAsaasChargesJob from '#jobs/payments/create_invoice_asaas_charges_job'
import SendInvoiceNotificationsJob from '#jobs/payments/send_invoice_notifications_job'
import SendOccurrenceAckRemindersJob from '#jobs/occurrences/send_occurrence_ack_reminders_job'
import SweepPendingAsaasDocumentsJob from '#jobs/asaas/sweep_pending_asaas_documents_job'
import GenerateSubscriptionInvoicesJob from '#jobs/payments/generate_subscription_invoices_job'
import RetrySubscriptionInvoiceChargesJob from '#jobs/payments/retry_subscription_invoice_charges_job'
import RetryPendingEventsJob from '#jobs/gamification/retry_pending_events_job'
import UpdateStreaksJob from '#jobs/gamification/update_streaks_job'

if (process.env.DISABLE_SCHEDULER) {
  console.log('[SCHEDULER] Scheduler disabled (DISABLE_SCHEDULER is set)')
} else {
  // 02:00 - Gerar pagamentos faltantes
  scheduler
    .call(async () => {
      await GenerateMissingPaymentsJob.dispatch({})
    })
    .daily()
    .at('02:00')

  // 03:00 - Gerar invoices (faturas)
  scheduler
    .call(async () => {
      await GenerateInvoicesJob.dispatch({})
    })
    .daily()
    .at('03:00')

  // 05:00 - Marcar invoices vencidas + recalcular encargos de atraso
  scheduler
    .call(async () => {
      await RefreshOverdueInvoicesJob.dispatch({})
    })
    .daily()
    .at('05:00')

  // 06:00 - Criar cobranças Asaas para invoices OPEN/OVERDUE sem charge
  scheduler
    .call(async () => {
      await CreateInvoiceAsaasChargesJob.dispatch({})
    })
    .daily()
    .at('06:00')

  // 06:30 - Enviar notificações consolidadas de invoices para responsáveis financeiros
  scheduler
    .call(async () => {
      await SendInvoiceNotificationsJob.dispatch({})
    })
    .daily()
    .at('06:30')

  // 09:00 (dias úteis) - Lembretes de reconhecimento de ocorrências
  scheduler
    .call(async () => {
      await SendOccurrenceAckRemindersJob.dispatch({})
    })
    .cron('0 9 * * 1-5')

  // 08:00 - Varredura diária de document URLs pendentes no Asaas
  scheduler
    .call(async () => {
      await SweepPendingAsaasDocumentsJob.dispatch({})
    })
    .daily()
    .at('08:00')

  // 04:00 (dia 1) - Gerar e cobrar assinaturas mensais de escolas/redes
  scheduler
    .call(async () => {
      await GenerateSubscriptionInvoicesJob.dispatch({})
    })
    .cron('0 4 1 * *')

  // 04:30 - Retentar cobranças automáticas de assinaturas com falha
  scheduler
    .call(async () => {
      await RetrySubscriptionInvoiceChargesJob.dispatch({})
    })
    .daily()
    .at('04:30')

  // ===== GAMIFICATION =====
  // (em prod, esses são trigados pelo GCP Cloud Scheduler via dispatch commands)
  // Aqui ficam apenas para testar localmente

  // A cada 15 minutos - Retry de eventos de gamificação que falharam
  scheduler
    .call(async () => {
      await RetryPendingEventsJob.dispatch({} as never)
    })
    .everyFifteenMinutes()

  // Daily 00:00 - Atualizar sequências (streaks) de alunos
  scheduler
    .call(async () => {
      await UpdateStreaksJob.dispatch({} as never)
    })
    .daily()
    .at('00:00')

  console.log('[SCHEDULER] Payment, invoice and gamification schedules configured')
}
// 02:00 - Gerar pagamentos faltantes
scheduler
  .call(async () => {
    await GenerateMissingPaymentsJob.dispatch({})
  })
  .daily()
  .at('02:00')

// 03:00 - Gerar invoices (faturas)
scheduler
  .call(async () => {
    await GenerateInvoicesJob.dispatch({})
  })
  .daily()
  .at('03:00')

// 05:00 - Marcar invoices vencidas + recalcular encargos de atraso
scheduler
  .call(async () => {
    await RefreshOverdueInvoicesJob.dispatch({})
  })
  .daily()
  .at('05:00')

// 06:00 - Criar cobranças Asaas para invoices OPEN/OVERDUE sem charge
scheduler
  .call(async () => {
    await CreateInvoiceAsaasChargesJob.dispatch({})
  })
  .daily()
  .at('06:00')

// 06:30 - Enviar notificações consolidadas de invoices para responsáveis financeiros
scheduler
  .call(async () => {
    await SendInvoiceNotificationsJob.dispatch({})
  })
  .daily()
  .at('06:30')

// 09:00 (dias úteis) - Lembretes de reconhecimento de ocorrências
scheduler
  .call(async () => {
    await SendOccurrenceAckRemindersJob.dispatch({})
  })
  .cron('0 9 * * 1-5')

// 08:00 - Varredura diária de document URLs pendentes no Asaas
scheduler
  .call(async () => {
    await SweepPendingAsaasDocumentsJob.dispatch({})
  })
  .daily()
  .at('08:00')

// 04:00 (dia 1) - Gerar e cobrar assinaturas mensais de escolas/redes
scheduler
  .call(async () => {
    await GenerateSubscriptionInvoicesJob.dispatch({})
  })
  .cron('0 4 1 * *')

// 04:30 - Retentar cobranças automáticas de assinaturas com falha
scheduler
  .call(async () => {
    await RetrySubscriptionInvoiceChargesJob.dispatch({})
  })
  .daily()
  .at('04:30')
