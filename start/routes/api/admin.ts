import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerImpersonationApiRoutes() {
  router
    .group(() => {
      router.post('/', [controllers.admin.SetImpersonation]).as('impersonation.set')
      router.delete('/', [controllers.admin.ClearImpersonation]).as('impersonation.clear')
      router
        .get('/status', [controllers.admin.GetImpersonationStatus])
        .as('impersonation.status')
      router
        .get('/config', [controllers.admin.GetImpersonationConfig])
        .as('impersonation.config')
    })
    .prefix('/admin/impersonation')
    .use(middleware.auth())
}

export function registerAdminOnboardingApiRoutes() {
  router
    .group(() => {
      router
        .post('/onboarding', [controllers.admin.CreateSchoolOnboarding])
        .as('admin.schools.onboarding')
    })
    .prefix('/admin/schools')
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
}

export function registerAdminJobsApiRoutes() {
  router
    .group(() => {
      router
        .post('/generate-missing-payments', [controllers.admin.TriggerMissingPayments])
        .as('admin.jobs.generate_missing_payments')
    })
    .prefix('/admin/jobs')
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
}

export function registerAdminStatsApiRoutes() {
  router
    .group(() => {
      router.get('/stats', [controllers.dashboard.GetAdminStats]).as('dashboard.admin_stats')
      router.get('/server-stats', [controllers.admin.GetServerStats]).as('dashboard.server_stats')
    })
    .prefix('/admin')
    .use([
      middleware.auth(),
      middleware.impersonation(),
      middleware.requireRole(['SUPER_ADMIN', 'ADMIN']),
    ])
}

export function registerAdminAiObservabilityRoutes() {
  router
    .group(() => {
      router.get('/tool-calls', [controllers.admin.ListAiToolCalls]).as('admin.ai.tool_calls')
      router
        .post('/tool-calls/:id/decide', [controllers.admin.DecideAiToolCall])
        .as('admin.ai.tool_calls.decide')
      router
        .get('/tokens/summary', [controllers.admin.GetAiTokenUsageSummary])
        .as('admin.ai.tokens.summary')
    })
    .prefix('/admin/ai')
    .use([
      middleware.auth(),
      middleware.impersonation(),
      middleware.requireRole(['SUPER_ADMIN', 'ADMIN']),
    ])
}
