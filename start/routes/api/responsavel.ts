import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Dashboard + Responsavel API Controllers
const GetResponsavelStatsController = () =>
  import('#controllers/dashboard/get_responsavel_stats_controller')

// Responsavel API Controllers
const GetResponsavelStudentGradesController = () =>
  import('#controllers/responsavel/get_student_grades_controller')
const GetResponsavelStudentAttendanceController = () =>
  import('#controllers/responsavel/get_student_attendance_controller')
const GetResponsavelStudentPaymentsController = () =>
  import('#controllers/responsavel/get_student_payments_controller')
const GetResponsavelStudentInvoicesController = () =>
  import('#controllers/responsavel/get_student_invoices_controller')
const GetResponsavelStudentBalanceController = () =>
  import('#controllers/responsavel/get_student_balance_controller')
const GetResponsavelStudentCanteenPurchasesController = () =>
  import('#controllers/responsavel/get_student_canteen_purchases_controller')
const ListStudentMealRecurrenceController = () =>
  import('#controllers/responsavel/list_student_meal_recurrence_controller')
const UpdateStudentMealRecurrenceController = () =>
  import('#controllers/responsavel/update_student_meal_recurrence_controller')
const GetResponsavelStudentAssignmentsController = () =>
  import('#controllers/responsavel/get_student_assignments_controller')
const GetResponsavelStudentScheduleController = () =>
  import('#controllers/responsavel/get_student_schedule_controller')
const GetResponsavelStudentDocumentsController = () =>
  import('#controllers/responsavel/get_student_documents_controller')
const GetResponsavelStudentOccurrencesController = () =>
  import('#controllers/responsavel/get_student_occurrences_controller')
const GetResponsavelStudentGamificationController = () =>
  import('#controllers/responsavel/get_student_gamification_controller')
const GetResponsavelStudentCalendarController = () =>
  import('#controllers/responsavel/get_student_calendar_controller')
const AcknowledgeOccurrenceController = () =>
  import('#controllers/responsavel/acknowledge_occurrence_controller')
const GetStudentOverviewController = () =>
  import('#controllers/responsavel/get_student_overview_controller')
const GetResponsavelNotificationsController = () =>
  import('#controllers/responsavel/get_notifications_controller')
const ListComunicadosController = () =>
  import('#controllers/responsavel/list_comunicados_controller')
const ShowComunicadoController = () => import('#controllers/responsavel/show_comunicado_controller')
const AcknowledgeComunicadoController = () =>
  import('#controllers/responsavel/acknowledge_comunicado_controller')
const ListPendingAcknowledgementsController = () =>
  import('#controllers/responsavel/list_pending_acknowledgements_controller')
const UpdateResponsavelProfileController = () =>
  import('#controllers/responsavel/update_profile_controller')
const CreateInvoiceAsaasChargeController = () =>
  import('#controllers/invoices/create_invoice_asaas_charge_controller')
const CreateWalletTopUpController = () =>
  import('#controllers/wallet_top_ups/create_wallet_top_up_controller')
const ListWalletTopUpsController = () =>
  import('#controllers/wallet_top_ups/list_wallet_top_ups_controller')
const ShowWalletTopUpController = () =>
  import('#controllers/wallet_top_ups/show_wallet_top_up_controller')

export function registerResponsavelApiRoutes() {
  router
    .get('/responsavel/stats', [GetResponsavelStatsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.responsavel_stats')

  router
    .group(() => {
      router
        .get('/students/:studentId/grades', [GetResponsavelStudentGradesController])
        .as('student_grades')
      router
        .get('/students/:studentId/attendance', [GetResponsavelStudentAttendanceController])
        .as('student_attendance')
      router
        .get('/students/:studentId/payments', [GetResponsavelStudentPaymentsController])
        .as('student_payments')
      router
        .get('/students/:studentId/invoices', [GetResponsavelStudentInvoicesController])
        .as('student_invoices')
      router
        .get('/students/:studentId/balance', [GetResponsavelStudentBalanceController])
        .as('student_balance')
      router
        .get('/students/:studentId/canteen-purchases', [
          GetResponsavelStudentCanteenPurchasesController,
        ])
        .as('student_canteen_purchases')
      router
        .get('/students/:studentId/meal-recurrence', [ListStudentMealRecurrenceController])
        .as('student_meal_recurrence')
      router
        .put('/students/:studentId/meal-recurrence', [UpdateStudentMealRecurrenceController])
        .as('update_student_meal_recurrence')
      router
        .get('/students/:studentId/assignments', [GetResponsavelStudentAssignmentsController])
        .as('student_assignments')
      router
        .get('/students/:studentId/schedule', [GetResponsavelStudentScheduleController])
        .as('student_schedule')
      router
        .get('/students/:studentId/documents', [GetResponsavelStudentDocumentsController])
        .as('student_documents')
      router
        .get('/students/:studentId/occurrences', [GetResponsavelStudentOccurrencesController])
        .as('student_occurrences')
      router
        .post('/students/:studentId/occurrences/:occurrenceId/acknowledge', [
          AcknowledgeOccurrenceController,
        ])
        .as('acknowledge_occurrence')
      router
        .get('/students/:studentId/overview', [GetStudentOverviewController])
        .as('student_overview')
      router
        .get('/students/:studentId/gamification', [GetResponsavelStudentGamificationController])
        .as('student_gamification')
      router
        .get('/students/:studentId/calendar', [GetResponsavelStudentCalendarController])
        .as('student_calendar')
      router.get('/notifications', [GetResponsavelNotificationsController]).as('notifications')
      router.get('/comunicados', [ListComunicadosController]).as('comunicados.list')
      router
        .get('/comunicados/pending-ack', [ListPendingAcknowledgementsController])
        .as('comunicados.pending_ack')
      router.get('/comunicados/:id', [ShowComunicadoController]).as('comunicados.details')
      router
        .post('/comunicados/:id/acknowledge', [AcknowledgeComunicadoController])
        .as('comunicados.acknowledge')
      router.put('/profile', [UpdateResponsavelProfileController]).as('update_profile')

      // Invoice checkout (Asaas on-demand charge)
      router
        .post('/invoices/:id/checkout', [CreateInvoiceAsaasChargeController])
        .as('invoice_checkout')

      // Wallet top-ups
      router
        .post('/students/:studentId/wallet-top-ups', [CreateWalletTopUpController])
        .as('create_wallet_top_up')
      router
        .get('/students/:studentId/wallet-top-ups', [ListWalletTopUpsController])
        .as('list_wallet_top_ups')
      router.get('/wallet-top-ups/:id', [ShowWalletTopUpController]).as('show_wallet_top_up')
    })
    .prefix('/responsavel')
    .use([middleware.auth(), middleware.impersonation()])
    .as('responsavel.api')
}
