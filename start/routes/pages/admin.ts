import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Admin Pages
const ShowAdminDashboardPageController = () =>
  import('#controllers/pages/admin/show_admin_dashboard_page_controller')
const ShowAdminEscolasPageController = () =>
  import('#controllers/pages/admin/show_admin_escolas_page_controller')
const ShowAdminBillingDashboardPageController = () =>
  import('#controllers/pages/admin/show_admin_billing_dashboard_page_controller')
const ShowAdminBillingFaturasPageController = () =>
  import('#controllers/pages/admin/show_admin_billing_faturas_page_controller')
const ShowAdminSubscriptionsPageController = () =>
  import('#controllers/pages/admin/show_admin_subscriptions_page_controller')
const ShowAdminRedesPageController = () =>
  import('#controllers/pages/admin/show_admin_redes_page_controller')
const ShowAdminAnalyticsPageController = () =>
  import('#controllers/pages/admin/show_admin_analytics_page_controller')
const ShowAdminSegurosPageController = () =>
  import('#controllers/pages/admin/show_admin_seguros_page_controller')
const ShowAdminConfiguracoesPageController = () =>
  import('#controllers/pages/admin/show_admin_configuracoes_page_controller')
const ShowSchoolOnboardingPageController = () =>
  import('#controllers/pages/admin/show_school_onboarding_page_controller')
const ShowSchoolDetailsPageController = () =>
  import('#controllers/pages/admin/show_school_details_page_controller')
const ShowEditSchoolPageController = () =>
  import('#controllers/pages/admin/show_edit_school_page_controller')

export function registerAdminPageRoutes() {
  router
    .group(() => {
      router.get('/', [ShowAdminDashboardPageController]).as('dashboard')
      router.get('/escolas', [ShowAdminEscolasPageController]).as('escolas')
      router.get('/escolas/:id/editar', [ShowEditSchoolPageController]).as('escolas.edit')
      router.get('/escolas/:id', [ShowSchoolDetailsPageController]).as('escolas.show')
      router.get('/onboarding', [ShowSchoolOnboardingPageController]).as('onboarding')
      router
        .get('/billing/dashboard', [ShowAdminBillingDashboardPageController])
        .as('billing.dashboard')
      router.get('/billing/faturas', [ShowAdminBillingFaturasPageController]).as('billing.faturas')
      router
        .get('/billing/subscriptions', [ShowAdminSubscriptionsPageController])
        .as('billing.subscriptions')
      router.get('/redes', [ShowAdminRedesPageController]).as('redes')
      router.get('/configuracoes', [ShowAdminConfiguracoesPageController]).as('configuracoes')

      // Seguros pages
      router.get('/seguros', [ShowAdminSegurosPageController]).as('seguros.index')
      router
        .get('/seguros/sinistros', [ShowAdminSegurosPageController, 'sinistros'])
        .as('seguros.sinistros')
      router
        .get('/seguros/faturamento', [ShowAdminSegurosPageController, 'faturamento'])
        .as('seguros.faturamento')
      router
        .get('/seguros/analytics', [ShowAdminSegurosPageController, 'analytics'])
        .as('seguros.analytics')
      router
        .get('/seguros/configuracao', [ShowAdminSegurosPageController, 'configuracao'])
        .as('seguros.configuracao')

      // Analytics pages
      router.get('/analytics', [ShowAdminAnalyticsPageController, 'index']).as('analytics.index')
      router
        .get('/analytics/academico', [ShowAdminAnalyticsPageController, 'academico'])
        .as('analytics.academico')
      router
        .get('/analytics/presenca', [ShowAdminAnalyticsPageController, 'presenca'])
        .as('analytics.presenca')
      router
        .get('/analytics/cantina', [ShowAdminAnalyticsPageController, 'cantina'])
        .as('analytics.cantina')
      router
        .get('/analytics/pagamentos', [ShowAdminAnalyticsPageController, 'pagamentos'])
        .as('analytics.pagamentos')
      router
        .get('/analytics/matriculas', [ShowAdminAnalyticsPageController, 'matriculas'])
        .as('analytics.matriculas')
      router
        .get('/analytics/ocorrencias', [ShowAdminAnalyticsPageController, 'ocorrencias'])
        .as('analytics.ocorrencias')
      router
        .get('/analytics/gamificacao', [ShowAdminAnalyticsPageController, 'gamificacao'])
        .as('analytics.gamificacao')
      router.get('/analytics/rh', [ShowAdminAnalyticsPageController, 'rh']).as('analytics.rh')
    })
    .prefix('/admin')
    .use([
      middleware.auth(),
      middleware.impersonation(),
      middleware.requireRole(['SUPER_ADMIN', 'ADMIN']),
    ])
    .as('admin')
}
