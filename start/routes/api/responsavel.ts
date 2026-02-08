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
const AcknowledgeOccurrenceController = () =>
  import('#controllers/responsavel/acknowledge_occurrence_controller')
const GetStudentOverviewController = () =>
  import('#controllers/responsavel/get_student_overview_controller')
const GetResponsavelNotificationsController = () =>
  import('#controllers/responsavel/get_notifications_controller')
const UpdateResponsavelProfileController = () =>
  import('#controllers/responsavel/update_profile_controller')
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
    .as('dashboard.responsavelStats')

  router
    .group(() => {
      router
        .get('/students/:studentId/grades', [GetResponsavelStudentGradesController])
        .as('studentGrades')
      router
        .get('/students/:studentId/attendance', [GetResponsavelStudentAttendanceController])
        .as('studentAttendance')
      router
        .get('/students/:studentId/payments', [GetResponsavelStudentPaymentsController])
        .as('studentPayments')
      router
        .get('/students/:studentId/invoices', [GetResponsavelStudentInvoicesController])
        .as('studentInvoices')
      router
        .get('/students/:studentId/balance', [GetResponsavelStudentBalanceController])
        .as('studentBalance')
      router
        .get('/students/:studentId/assignments', [GetResponsavelStudentAssignmentsController])
        .as('studentAssignments')
      router
        .get('/students/:studentId/schedule', [GetResponsavelStudentScheduleController])
        .as('studentSchedule')
      router
        .get('/students/:studentId/documents', [GetResponsavelStudentDocumentsController])
        .as('studentDocuments')
      router
        .get('/students/:studentId/occurrences', [GetResponsavelStudentOccurrencesController])
        .as('studentOccurrences')
      router
        .post('/students/:studentId/occurrences/:occurrenceId/acknowledge', [
          AcknowledgeOccurrenceController,
        ])
        .as('acknowledgeOccurrence')
      router
        .get('/students/:studentId/overview', [GetStudentOverviewController])
        .as('studentOverview')
      router
        .get('/students/:studentId/gamification', [GetResponsavelStudentGamificationController])
        .as('studentGamification')
      router.get('/notifications', [GetResponsavelNotificationsController]).as('notifications')
      router.put('/profile', [UpdateResponsavelProfileController]).as('updateProfile')

      // Wallet top-ups
      router
        .post('/students/:studentId/wallet-top-ups', [CreateWalletTopUpController])
        .as('createWalletTopUp')
      router
        .get('/students/:studentId/wallet-top-ups', [ListWalletTopUpsController])
        .as('listWalletTopUps')
      router.get('/wallet-top-ups/:id', [ShowWalletTopUpController]).as('showWalletTopUp')
    })
    .prefix('/responsavel')
    .use([middleware.auth(), middleware.impersonation()])
    .as('responsavel.api')
}
