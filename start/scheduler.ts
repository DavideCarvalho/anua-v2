import scheduler from 'adonisjs-scheduler/services/main'
import { getQueueManager } from '#services/queue_service'
import GenerateMissingPaymentsJob from '#jobs/payments/generate_missing_payments_job'
import GenerateInvoicesJob from '#jobs/payments/generate_invoices_job'
import MarkOverdueInvoicesJob from '#jobs/payments/mark_overdue_invoices_job'
import ApplyInvoiceInterestJob from '#jobs/payments/apply_invoice_interest_job'
import CreateInvoiceAsaasChargesJob from '#jobs/payments/create_invoice_asaas_charges_job'
import SendInvoiceNotificationsJob from '#jobs/payments/send_invoice_notifications_job'
import SendOccurrenceAckRemindersJob from '#jobs/occurrences/send_occurrence_ack_reminders_job'
import SweepPendingAsaasDocumentsJob from '#jobs/asaas/sweep_pending_asaas_documents_job'

if (process.env.DISABLE_SCHEDULER) {
  console.log('[SCHEDULER] Scheduler disabled (DISABLE_SCHEDULER is set)')
} else {
  // 02:00 - Gerar pagamentos faltantes
  scheduler
    .call(async () => {
      await getQueueManager()
      await GenerateMissingPaymentsJob.dispatch({})
    })
    .daily()
    .at('02:00')

  // 03:00 - Gerar invoices (faturas)
  scheduler
    .call(async () => {
      await getQueueManager()
      await GenerateInvoicesJob.dispatch({})
    })
    .daily()
    .at('03:00')

  // 05:00 - Marcar invoices vencidas como OVERDUE
  scheduler
    .call(async () => {
      await getQueueManager()
      await MarkOverdueInvoicesJob.dispatch({})
    })
    .daily()
    .at('05:00')

  // 05:30 - Aplicar multa/juros em invoices OVERDUE e cancelar charges desatualizados
  scheduler
    .call(async () => {
      await getQueueManager()
      await ApplyInvoiceInterestJob.dispatch({})
    })
    .daily()
    .at('05:30')

  // 06:00 - Criar cobranças Asaas para invoices OPEN/OVERDUE sem charge
  scheduler
    .call(async () => {
      await getQueueManager()
      await CreateInvoiceAsaasChargesJob.dispatch({})
    })
    .daily()
    .at('06:00')

  // 06:30 - Enviar notificações consolidadas de invoices para responsáveis financeiros
  scheduler
    .call(async () => {
      await getQueueManager()
      await SendInvoiceNotificationsJob.dispatch({})
    })
    .daily()
    .at('06:30')

  // 09:00 (dias úteis) - Lembretes de reconhecimento de ocorrências
  scheduler
    .call(async () => {
      await getQueueManager()
      await SendOccurrenceAckRemindersJob.dispatch({})
    })
    .cron('0 9 * * 1-5')

  // 08:00 - Varredura diária de document URLs pendentes no Asaas
  scheduler
    .call(async () => {
      await getQueueManager()
      await SweepPendingAsaasDocumentsJob.dispatch({})
    })
    .daily()
    .at('08:00')

  console.log('[SCHEDULER] Payment and invoice schedules configured')
}
