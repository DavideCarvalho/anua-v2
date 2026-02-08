import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Impersonation
const SetImpersonationController = () => import('#controllers/admin/set_impersonation_controller')
const ClearImpersonationController = () =>
  import('#controllers/admin/clear_impersonation_controller')
const GetImpersonationStatusController = () =>
  import('#controllers/admin/get_impersonation_status_controller')
const GetImpersonationConfigController = () =>
  import('#controllers/admin/get_impersonation_config_controller')

// Admin - Onboarding
const CreateSchoolOnboardingController = () =>
  import('#controllers/admin/create_school_onboarding_controller')

// Admin - Jobs
const TriggerMissingPaymentsController = () =>
  import('#controllers/admin/trigger_missing_payments_controller')

// Admin stats
const GetAdminStatsController = () => import('#controllers/dashboard/get_admin_stats_controller')

export function registerImpersonationApiRoutes() {
  router
    .group(() => {
      // Ativar impersonation
      router.post('/', [SetImpersonationController]).as('impersonation.set')

      // Desativar impersonation
      router.delete('/', [ClearImpersonationController]).as('impersonation.clear')

      // Status de impersonation
      router.get('/status', [GetImpersonationStatusController]).as('impersonation.status')

      // Lista de usuarios para impersonation
      router.get('/config', [GetImpersonationConfigController]).as('impersonation.config')
    })
    .prefix('/admin/impersonation')
    .use(middleware.auth())
}

export function registerAdminOnboardingApiRoutes() {
  router
    .group(() => {
      router.post('/onboarding', [CreateSchoolOnboardingController]).as('admin.schools.onboarding')
    })
    .prefix('/admin/schools')
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
}

export function registerAdminJobsApiRoutes() {
  router
    .group(() => {
      router
        .post('/generate-missing-payments', [TriggerMissingPaymentsController])
        .as('admin.jobs.generateMissingPayments')
    })
    .prefix('/admin/jobs')
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
}

export function registerAdminStatsApiRoutes() {
  router
    .get('/admin/stats', [GetAdminStatsController])
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
    .as('dashboard.adminStats')
}
