import GenerateAgreementProposalsJob from '#jobs/payments/generate_agreement_proposals_job'
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
import CreateMealRecurrenceReservationsJob from '#jobs/canteen/create_meal_recurrence_reservations_job'
import SendEnrollmentRemindersJob from '#jobs/enrollment/send_enrollment_reminders_job'
import SendDailyAcademicDigestJob from '#jobs/notifications/send_daily_academic_digest_job'
import SendWeeklyAcademicDigestJob from '#jobs/notifications/send_weekly_academic_digest_job'
import SendEventDayRemindersJob from '#jobs/notifications/send_event_day_reminders_job'
import SendParentalConsentRemindersJob from '#jobs/notifications/send_parental_consent_reminders_job'

const tz = 'America/Sao_Paulo'

// 02:00 - Gerar pagamentos faltantes
await GenerateMissingPaymentsJob.schedule({}).cron('0 2 * * *').timezone(tz)

// 03:00 - Gerar invoices (faturas)
await GenerateInvoicesJob.schedule({}).cron('0 3 * * *').timezone(tz)

// 04:00 (dia 1) - Gerar e cobrar assinaturas mensais de escolas/redes
await GenerateSubscriptionInvoicesJob.schedule({}).cron('0 4 1 * *').timezone(tz)

// 04:30 - Retentar cobranças automáticas de assinaturas com falha
await RetrySubscriptionInvoiceChargesJob.schedule({}).cron('30 4 * * *').timezone(tz)

// 05:00 - Marcar invoices vencidas + recalcular encargos de atraso
await RefreshOverdueInvoicesJob.schedule({}).cron('0 5 * * *').timezone(tz)

// 05:30 - Criar reservas de refeições a partir da recorrência (almoço/janta)
await CreateMealRecurrenceReservationsJob.schedule({}).cron('30 5 * * *').timezone(tz)

// 06:00 - Criar cobranças Asaas para invoices OPEN/OVERDUE sem charge
await CreateInvoiceAsaasChargesJob.schedule({}).cron('0 6 * * *').timezone(tz)

// 06:30 - Enviar notificações consolidadas de invoices para responsáveis financeiros
await SendInvoiceNotificationsJob.schedule({}).cron('30 6 * * *').timezone(tz)

// 07:00 - Gerar propostas de acordo para faturas > 15 dias em atraso
await GenerateAgreementProposalsJob.schedule({}).cron('0 7 * * *').timezone(tz)

// 08:00 - Varredura diária de document URLs pendentes no Asaas
await SweepPendingAsaasDocumentsJob.schedule({}).cron('0 8 * * *').timezone(tz)

// 09:00 (dias úteis) - Lembretes de reconhecimento de ocorrências
await SendOccurrenceAckRemindersJob.schedule({}).cron('0 9 * * 1-5').timezone(tz)

// 10:00 (dias úteis) - Lembretes de matrículas paradas (ADR-0004 evento 4)
await SendEnrollmentRemindersJob.schedule({}).cron('0 10 * * 1-5').timezone(tz)

// 19:00 (todo dia) - Email "amanhã na escola" pros responsáveis pedagógicos
await SendDailyAcademicDigestJob.schedule({}).cron('0 19 * * *').timezone(tz)

// 07:00 (segunda) - Email "esta semana na escola" pros responsáveis pedagógicos
await SendWeeklyAcademicDigestJob.schedule({}).cron('0 7 * * 1').timezone(tz)

// 07:30 (todo dia) - Push matinal D-0 lembrando eventos importantes do dia
await SendEventDayRemindersJob.schedule({}).cron('30 7 * * *').timezone(tz)

// 10:00 (todo dia) - Lembrete D-3 de autorizações parentais pendentes
await SendParentalConsentRemindersJob.schedule({}).cron('0 10 * * *').timezone(tz)

// Gamificação: a cada 15 minutos - Retry de eventos que falharam
await RetryPendingEventsJob.schedule({} as never)
  .cron('*/15 * * * *')
  .timezone(tz)

// Gamificação: 00:00 - Atualizar sequências (streaks) de alunos
await UpdateStreaksJob.schedule({} as never)
  .cron('0 0 * * *')
  .timezone(tz)

console.log('[SCHEDULER] Schedules configured via @adonisjs/queue')
