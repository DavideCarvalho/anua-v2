import scheduler from 'adonisjs-scheduler/services/main'
import GenerateMissingPayments from '#start/jobs/generate_missing_payments'
import GenerateInvoices from '#start/jobs/generate_invoices'
import MarkOverdueInvoices from '#start/jobs/mark_overdue_invoices'

// Gerar pagamentos faltantes - Diariamente às 02:00
scheduler
  .call(async () => {
    await GenerateMissingPayments.handle()
  })
  .daily()
  .at('02:00')

// Gerar invoices (faturas) - Diariamente às 03:00 (depois dos pagamentos)
scheduler
  .call(async () => {
    await GenerateInvoices.handle()
  })
  .daily()
  .at('03:00')

// Marcar invoices vencidas como OVERDUE - Diariamente às 06:00
scheduler
  .call(async () => {
    await MarkOverdueInvoices.handle()
  })
  .daily()
  .at('06:00')

console.log('[SCHEDULER] Payment and invoice schedules configured')
