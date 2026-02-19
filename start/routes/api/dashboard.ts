import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Dashboard API Controllers
const GetEscolaStatsController = () => import('#controllers/dashboard/get_escola_stats_controller')
const GetEscolaInsightsController = () =>
  import('#controllers/dashboard/get_escola_insights_controller')
const GetEscolaTeacherDashboardController = () =>
  import('#controllers/dashboard/get_escola_teacher_dashboard_controller')

export function registerDashboardApiRoutes() {
  router
    .get('/escola/stats', [GetEscolaStatsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escolaStats')
  router
    .get('/escola/insights', [GetEscolaInsightsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escolaInsights')
  router
    .get('/escola/teacher-dashboard', [GetEscolaTeacherDashboardController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escolaTeacherDashboard')
}
