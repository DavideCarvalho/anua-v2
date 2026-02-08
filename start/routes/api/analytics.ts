import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Analytics
const GetAttendanceOverviewController = () =>
  import('#controllers/analytics/get_attendance_overview_controller')
const GetAttendanceTrendsController = () =>
  import('#controllers/analytics/get_attendance_trends_controller')
const GetChronicAbsenteeismController = () =>
  import('#controllers/analytics/get_chronic_absenteeism_controller')
const GetCanteenOverviewController = () =>
  import('#controllers/analytics/get_canteen_overview_controller')
const GetCanteenTrendsController = () =>
  import('#controllers/analytics/get_canteen_trends_controller')
const GetCanteenTopItemsController = () =>
  import('#controllers/analytics/get_canteen_top_items_controller')
const GetPaymentsOverviewController = () =>
  import('#controllers/analytics/get_payments_overview_controller')
const GetEnrollmentsOverviewController = () =>
  import('#controllers/analytics/get_enrollments_overview_controller')
const GetEnrollmentFunnelStatsController = () =>
  import('#controllers/analytics/get_enrollment_funnel_stats_controller')
const GetEnrollmentTrendsController = () =>
  import('#controllers/analytics/get_enrollment_trends_controller')
const GetEnrollmentByLevelController = () =>
  import('#controllers/analytics/get_enrollment_by_level_controller')
const GetIncidentsOverviewController = () =>
  import('#controllers/analytics/get_incidents_overview_controller')
const GetGamificationOverviewController = () =>
  import('#controllers/analytics/get_gamification_overview_controller')
const GetHrOverviewController = () => import('#controllers/analytics/get_hr_overview_controller')

export function registerAnalyticsApiRoutes() {
  router
    .group(() => {
      router
        .get('/attendance/overview', [GetAttendanceOverviewController])
        .as('analytics.attendance.overview')
      router
        .get('/attendance/trends', [GetAttendanceTrendsController])
        .as('analytics.attendance.trends')
      router
        .get('/attendance/chronic', [GetChronicAbsenteeismController])
        .as('analytics.attendance.chronic')
      router
        .get('/canteen/overview', [GetCanteenOverviewController])
        .as('analytics.canteen.overview')
      router.get('/canteen/trends', [GetCanteenTrendsController]).as('analytics.canteen.trends')
      router
        .get('/canteen/top-items', [GetCanteenTopItemsController])
        .as('analytics.canteen.topItems')
      router
        .get('/payments/overview', [GetPaymentsOverviewController])
        .as('analytics.payments.overview')
      router
        .get('/enrollments/overview', [GetEnrollmentsOverviewController])
        .as('analytics.enrollments.overview')
      router
        .get('/enrollments/funnel', [GetEnrollmentFunnelStatsController])
        .as('analytics.enrollments.funnel')
      router
        .get('/enrollments/trends', [GetEnrollmentTrendsController])
        .as('analytics.enrollments.trends')
      router
        .get('/enrollments/by-level', [GetEnrollmentByLevelController])
        .as('analytics.enrollments.byLevel')
      router
        .get('/incidents/overview', [GetIncidentsOverviewController])
        .as('analytics.incidents.overview')
      router
        .get('/gamification/overview', [GetGamificationOverviewController])
        .as('analytics.gamification.overview')
      router.get('/hr/overview', [GetHrOverviewController]).as('analytics.hr.overview')
    })
    .prefix('/analytics')
    .use([middleware.auth(), middleware.impersonation()])
}
