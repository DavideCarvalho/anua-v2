import scheduler from 'adonisjs-scheduler/services/main'
import GenerateMissingPayments from '#start/jobs/generate_missing_payments'

// Gerar pagamentos faltantes - Diariamente às 02:00
scheduler
  .call(async () => {
    await GenerateMissingPayments.handle()
  })
  .daily()
  .at('02:00')

console.log('[SCHEDULER] Payment schedules configured')
