import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerDashboardApiRoutes() {
  router
    .get('/escola/stats', [controllers.dashboard.GetEscolaStats])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_stats')
  router
    .get('/escola/insights', [controllers.dashboard.GetEscolaInsights])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_insights')
  router
    .get('/escola/teacher-dashboard', [controllers.dashboard.GetEscolaTeacherDashboard])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_teacher_dashboard')
  router
    .get('/escola/pedagogical-alerts', [controllers.dashboard.GetPedagogicalAlerts])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escola_pedagogical_alerts')
}
