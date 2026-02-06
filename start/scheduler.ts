import scheduler from 'adonisjs-scheduler/services/main'
import { getQueueManager } from '#services/queue_service'
import GenerateMissingPaymentsJob from '#jobs/payments/generate_missing_payments_job'
import GenerateInvoicesJob from '#jobs/payments/generate_invoices_job'
import MarkOverdueInvoicesJob from '#jobs/payments/mark_overdue_invoices_job'

if (process.env.DISABLE_SCHEDULER) {
  console.log('[SCHEDULER] Scheduler disabled (DISABLE_SCHEDULER is set)')
} else {
  // Gerar pagamentos faltantes - Diariamente às 02:00
  scheduler
    .call(async () => {
      await getQueueManager()
      await GenerateMissingPaymentsJob.dispatch({})
    })
    .daily()
    .at('02:00')

  // Gerar invoices (faturas) - Diariamente às 03:00 (depois dos pagamentos)
  scheduler
    .call(async () => {
      await getQueueManager()
      await GenerateInvoicesJob.dispatch({})
    })
    .daily()
    .at('03:00')

  // Marcar invoices vencidas como OVERDUE - Diariamente às 06:00
  scheduler
    .call(async () => {
      await getQueueManager()
      await MarkOverdueInvoicesJob.dispatch({})
    })
    .daily()
    .at('06:00')

  console.log('[SCHEDULER] Payment and invoice schedules configured')
}
