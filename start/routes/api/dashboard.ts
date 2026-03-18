import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const GetEscolaStatsController = () => import('#controllers/dashboard/get_escola_stats_controller')
const GetEscolaInsightsController = () =>
  import('#controllers/dashboard/get_escola_insights_controller')
const GetEscolaTeacherDashboardController = () =>
  import('#controllers/dashboard/get_escola_teacher_dashboard_controller')
const GetPedagogicalAlertsController = () =>
  import('#controllers/dashboard/get_pedagogical_alerts_controller')

export function registerDashboardApiRoutes() {
  router
    .get('/escola/stats', [GetEscolaStatsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_stats')
  router
    .get('/escola/insights', [GetEscolaInsightsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_insights')
  router
    .get('/escola/teacher-dashboard', [GetEscolaTeacherDashboardController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_teacher_dashboard')
  router
    .get('/escola/pedagogical-alerts', [GetPedagogicalAlertsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_pedagogical_alerts')
}
