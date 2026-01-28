import scheduler from 'adonisjs-scheduler/services/main'

// Gerar pagamentos faltantes - Diariamente às 02:00
scheduler
  .call(async () => {
    const GenerateMissingPayments = (await import('#start/jobs/generate_missing_payments')).default
    await GenerateMissingPayments.handle()
  })
  .daily()
  .at('02:00')

console.log('[SCHEDULER] Payment schedules configured')
