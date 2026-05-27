import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerVerifyEnrollmentRoute() {
  router
    .get('/verify-enrollment/:token', [controllers.public.VerifyEnrollment])
    .as('verify_enrollment')
}

export function registerCalendarFeedRoutes() {
  router
    .get('/calendars/:token', [controllers.calendars.GetCalendarFeed])
    .as('calendar_feed')
}

export function registerResponsavelApiRoutes() {
  router
    .get('/responsavel/stats', [controllers.dashboard.GetResponsavelStats])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.responsavel_stats')

  router
    .get('/responsavel/alerts', [controllers.dashboard.GetResponsavelAlerts])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.responsavel_alerts')

  router
    .group(() => {
      router
        .get('/students/:studentId/academic-periods', [
          controllers.responsavel.GetStudentAcademicPeriods,
        ])
        .as('student_academic_periods')
      router
        .get('/students/:studentId/grades', [controllers.responsavel.GetStudentGrades])
        .as('student_grades')
      router
        .get('/students/:studentId/attendance', [controllers.responsavel.GetStudentAttendance])
        .as('student_attendance')
      router
        .get('/students/:studentId/payments', [controllers.responsavel.GetStudentPayments])
        .as('student_payments')
      router
        .get('/students/:studentId/invoices', [controllers.responsavel.GetStudentInvoices])
        .as('student_invoices')
      router
        .get('/students/:studentId/balance', [controllers.responsavel.GetStudentBalance])
        .as('student_balance')
      router
        .get('/students/:studentId/canteen-purchases', [
          controllers.responsavel.GetStudentCanteenPurchases,
        ])
        .as('student_canteen_purchases')
      router
        .get('/students/:studentId/meal-recurrence', [
          controllers.responsavel.ListStudentMealRecurrence,
        ])
        .as('student_meal_recurrence')
      router
        .put('/students/:studentId/meal-recurrence', [
          controllers.responsavel.UpdateStudentMealRecurrence,
        ])
        .as('update_student_meal_recurrence')
      router
        .get('/students/:studentId/assignments', [controllers.responsavel.GetStudentAssignments])
        .as('student_assignments')
      router
        .get('/students/:studentId/schedule', [controllers.responsavel.GetStudentSchedule])
        .as('student_schedule')
      router
        .get('/students/:studentId/documents', [controllers.responsavel.GetStudentDocuments])
        .as('student_documents')
      router
        .post('/students/:studentId/submissions/:submissionId/files', [
          controllers.responsavel.UploadStudentDocument,
        ])
        .as('upload_student_document')
      router
        .get('/matriculas/:matriculaId', [controllers.responsavel.GetEnrollmentAxes])
        .as('enrollment_axes')
      router
        .get('/students/:studentId/occurrences', [controllers.responsavel.GetStudentOccurrences])
        .as('student_occurrences')
      router
        .post('/students/:studentId/occurrences/:occurrenceId/acknowledge', [
          controllers.responsavel.AcknowledgeOccurrence,
        ])
        .as('acknowledge_occurrence')
      router
        .get('/students/:studentId/overview', [controllers.responsavel.GetStudentOverview])
        .as('student_overview')
      router
        .get('/students/:studentId/gamification', [controllers.responsavel.GetStudentGamification])
        .as('student_gamification')
      router
        .get('/students/:studentId/calendar', [controllers.responsavel.GetStudentCalendar])
        .as('student_calendar')
      router
        .get('/students/:studentId/calendar-feed-url', [
          controllers.calendars.GetCalendarFeedUrl,
        ])
        .as('student_calendar_feed_url')
      router
        .get('/matriculas/:matriculaId/certificate', [
          controllers.responsavel.GetEnrollmentCertificate,
        ])
        .as('enrollment_certificate')
      router.get('/notifications', [controllers.responsavel.GetNotifications]).as('notifications')
      router.get('/comunicados', [controllers.responsavel.ListComunicados]).as('comunicados.list')
      router
        .get('/comunicados/pending-ack', [controllers.responsavel.ListPendingAcknowledgements])
        .as('comunicados.pending_ack')
      router
        .get('/comunicados/:id', [controllers.responsavel.ShowComunicado])
        .as('comunicados.details')
      router
        .post('/comunicados/:id/acknowledge', [controllers.responsavel.AcknowledgeComunicado])
        .as('comunicados.acknowledge')
      router.put('/profile', [controllers.responsavel.UpdateProfile]).as('update_profile')

      // Agreement proposals
      router
        .get('/students/:studentId/agreement-proposals', [
          controllers.agreementProposals.ListStudentAgreementProposals,
        ])
        .as('student_agreement_proposals')
      router
        .post('/agreement-proposals/:id/accept', [
          controllers.agreementProposals.AcceptAgreementProposal,
        ])
        .as('accept_agreement_proposal')
      router
        .post('/agreement-proposals/:id/reject', [
          controllers.agreementProposals.RejectResponsibleAgreementProposal,
        ])
        .as('reject_agreement_proposal')

      // Invoice checkout (Asaas on-demand charge)
      router
        .post('/invoices/:id/checkout', [controllers.invoices.CreateInvoiceAsaasCharge])
        .as('invoice_checkout')

      // Wallet top-ups
      router
        .post('/students/:studentId/wallet-top-ups', [controllers.walletTopUps.CreateWalletTopUp])
        .as('create_wallet_top_up')
      router
        .get('/students/:studentId/wallet-top-ups', [controllers.walletTopUps.ListWalletTopUps])
        .as('list_wallet_top_ups')
      router
        .get('/wallet-top-ups/:id', [controllers.walletTopUps.ShowWalletTopUp])
        .as('show_wallet_top_up')

      // Inquiries
      router
        .get('/students/:studentId/inquiries', [controllers.responsavel.ListStudentInquiries])
        .as('inquiries.list')
      router
        .post('/students/:studentId/inquiries', [controllers.responsavel.CreateStudentInquiry])
        .as('inquiries.create')
      router
        .get('/inquiries/:inquiryId', [controllers.responsavel.ShowInquiry])
        .as('inquiries.show')
      router
        .post('/inquiries/:inquiryId/messages', [controllers.responsavel.CreateInquiryMessage])
        .as('inquiries.messages.create')
      router
        .post('/inquiries/:inquiryId/resolve', [controllers.responsavel.ResolveInquiry])
        .as('inquiries.resolve')
      router
        .post('/inquiries/:inquiryId/mark-read', [controllers.responsavel.MarkInquiryRead])
        .as('inquiries.mark-read')
    })
    .prefix('/responsavel')
    .use([middleware.auth(), middleware.impersonation()])
    .as('responsavel.api')
}
