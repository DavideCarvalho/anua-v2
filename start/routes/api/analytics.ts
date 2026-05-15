import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAnalyticsApiRoutes() {
  router
    .group(() => {
      router
        .get('/attendance/overview', [controllers.analytics.GetAttendanceOverview])
        .as('analytics.attendance.overview')
      router
        .get('/attendance/trends', [controllers.analytics.GetAttendanceTrends])
        .as('analytics.attendance.trends')
      router
        .get('/attendance/chronic', [controllers.analytics.GetChronicAbsenteeism])
        .as('analytics.attendance.chronic')
      router
        .get('/attendance/late-chronic', [controllers.analytics.GetChronicLateness])
        .as('analytics.attendance.late_chronic')
      router
        .get('/canteen/overview', [controllers.analytics.GetCanteenOverview])
        .as('analytics.canteen.overview')
      router
        .get('/canteen/trends', [controllers.analytics.GetCanteenTrends])
        .as('analytics.canteen.trends')
      router
        .get('/canteen/top-items', [controllers.analytics.GetCanteenTopItems])
        .as('analytics.canteen.top_items')
      router
        .get('/payments/overview', [controllers.analytics.GetPaymentsOverview])
        .as('analytics.payments.overview')
      router
        .get('/enrollments/overview', [controllers.analytics.GetEnrollmentsOverview])
        .as('analytics.enrollments.overview')
      router
        .get('/enrollments/funnel', [controllers.analytics.GetEnrollmentFunnelStats])
        .as('analytics.enrollments.funnel')
      router
        .get('/enrollments/trends', [controllers.analytics.GetEnrollmentTrends])
        .as('analytics.enrollments.trends')
      router
        .get('/enrollments/by-level', [controllers.analytics.GetEnrollmentByLevel])
        .as('analytics.enrollments.by_level')
      router
        .get('/incidents/overview', [controllers.analytics.GetIncidentsOverview])
        .as('analytics.incidents.overview')
      router
        .get('/gamification/overview', [controllers.analytics.GetGamificationOverview])
        .as('analytics.gamification.overview')
      router
        .get('/hr/overview', [controllers.analytics.GetHrOverview])
        .as('analytics.hr.overview')
      router
        .get('/class-performance', [controllers.analytics.GetClassPerformance])
        .as('analytics.class_performance')
    })
    .prefix('/analytics')
    .use([middleware.auth(), middleware.impersonation()])
}
