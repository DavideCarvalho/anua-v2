import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerAdminPageRoutes() {
  const admin = controllers.pages.admin

  router
    .group(() => {
      router.get('/', [admin.ShowAdminDashboardPage]).as('dashboard')
      router.get('/escolas', [admin.ShowAdminEscolasPage]).as('escolas')
      router.get('/escolas/:id/editar', [admin.ShowEditSchoolPage]).as('escolas.edit')
      router.get('/escolas/:id', [admin.ShowSchoolDetailsPage]).as('escolas.show')
      router.get('/onboarding', [admin.ShowSchoolOnboardingPage]).as('onboarding')
      router
        .get('/billing/dashboard', [admin.ShowAdminBillingDashboardPage])
        .as('billing.dashboard')
      router.get('/billing/faturas', [admin.ShowAdminBillingFaturasPage]).as('billing.faturas')
      router
        .get('/billing/subscriptions', [admin.ShowAdminSubscriptionsPage])
        .as('billing.subscriptions')
      router.get('/redes', [admin.ShowAdminRedesPage]).as('redes')
      router.get('/configuracoes', [admin.ShowAdminConfiguracoesPage]).as('configuracoes')

      // AI observability
      router.get('/ai/auditoria', [admin.ShowAdminAiAuditPage, 'audit']).as('ai.auditoria')
      router.get('/ai/tokens', [admin.ShowAdminAiAuditPage, 'tokens']).as('ai.tokens')

      // Seguros pages
      router.get('/seguros', [admin.ShowAdminSegurosPage]).as('seguros.index')
      router
        .get('/seguros/sinistros', [admin.ShowAdminSegurosPage, 'sinistros'])
        .as('seguros.sinistros')
      router
        .get('/seguros/faturamento', [admin.ShowAdminSegurosPage, 'faturamento'])
        .as('seguros.faturamento')
      router
        .get('/seguros/analytics', [admin.ShowAdminSegurosPage, 'analytics'])
        .as('seguros.analytics')
      router
        .get('/seguros/configuracao', [admin.ShowAdminSegurosPage, 'configuracao'])
        .as('seguros.configuracao')

      // Analytics pages
      router.get('/analytics', [admin.ShowAdminAnalyticsPage, 'index']).as('analytics.index')
      router
        .get('/analytics/academico', [admin.ShowAdminAnalyticsPage, 'academico'])
        .as('analytics.academico')
      router
        .get('/analytics/presenca', [admin.ShowAdminAnalyticsPage, 'presenca'])
        .as('analytics.presenca')
      router
        .get('/analytics/cantina', [admin.ShowAdminAnalyticsPage, 'cantina'])
        .as('analytics.cantina')
      router
        .get('/analytics/pagamentos', [admin.ShowAdminAnalyticsPage, 'pagamentos'])
        .as('analytics.pagamentos')
      router
        .get('/analytics/matriculas', [admin.ShowAdminAnalyticsPage, 'matriculas'])
        .as('analytics.matriculas')
      router
        .get('/analytics/ocorrencias', [admin.ShowAdminAnalyticsPage, 'ocorrencias'])
        .as('analytics.ocorrencias')
      router
        .get('/analytics/gamificacao', [admin.ShowAdminAnalyticsPage, 'gamificacao'])
        .as('analytics.gamificacao')
      router.get('/analytics/rh', [admin.ShowAdminAnalyticsPage, 'rh']).as('analytics.rh')
      router
        .get('/analytics/school-health', [admin.ShowAdminAnalyticsPage, 'schoolHealth'])
        .as('analytics.school_health')
    })
    .prefix('/admin')
    .use([
      middleware.auth(),
      middleware.impersonation(),
      middleware.requireRole(['SUPER_ADMIN', 'ADMIN']),
    ])
    .as('admin')
}
