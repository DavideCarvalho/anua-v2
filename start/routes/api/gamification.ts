import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Student Gamifications
const ListStudentGamificationsController = () =>
  import('#controllers/student_gamifications/list_student_gamifications_controller')
const ShowStudentGamificationController = () =>
  import('#controllers/student_gamifications/show_student_gamification_controller')
const CreateStudentGamificationController = () =>
  import('#controllers/student_gamifications/create_student_gamification_controller')
const AddPointsController = () => import('#controllers/student_gamifications/add_points_controller')
const GetStudentStatsController = () =>
  import('#controllers/student_gamifications/get_student_stats_controller')
const GetPointsRankingController = () =>
  import('#controllers/student_gamifications/get_points_ranking_controller')

// Leaderboards
const ListLeaderboardsController = () =>
  import('#controllers/leaderboards/list_leaderboards_controller')
const ShowLeaderboardController = () =>
  import('#controllers/leaderboards/show_leaderboard_controller')
const CreateLeaderboardController = () =>
  import('#controllers/leaderboards/create_leaderboard_controller')
const UpdateLeaderboardController = () =>
  import('#controllers/leaderboards/update_leaderboard_controller')
const DeleteLeaderboardController = () =>
  import('#controllers/leaderboards/delete_leaderboard_controller')
const ListLeaderboardEntriesController = () =>
  import('#controllers/leaderboards/list_leaderboard_entries_controller')

// Gamification Events
const ListGamificationEventsController = () =>
  import('#controllers/gamification_events/list_gamification_events_controller')
const ShowGamificationEventController = () =>
  import('#controllers/gamification_events/show_gamification_event_controller')
const CreateGamificationEventController = () =>
  import('#controllers/gamification_events/create_gamification_event_controller')
const RetryGamificationEventController = () =>
  import('#controllers/gamification_events/retry_gamification_event_controller')

export function registerStudentGamificationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStudentGamificationsController]).as('studentGamifications.index')
      router.post('/', [CreateStudentGamificationController]).as('studentGamifications.store')
      router.get('/:id', [ShowStudentGamificationController]).as('studentGamifications.show')
      router.post('/add-points', [AddPointsController]).as('studentGamifications.addPoints')
      router.get('/ranking', [GetPointsRankingController]).as('studentGamifications.ranking')
    })
    .prefix('/student-gamifications')
    .use(middleware.auth())

  // Student stats route (nested under students)
  router
    .group(() => {
      router
        .get('/:studentId/gamification/stats', [GetStudentStatsController])
        .as('students.gamificationStats')
    })
    .prefix('/students')
    .use(middleware.auth())
}

export function registerLeaderboardApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListLeaderboardsController]).as('leaderboards.index')
      router.post('/', [CreateLeaderboardController]).as('leaderboards.store')
      router.get('/:id', [ShowLeaderboardController]).as('leaderboards.show')
      router.put('/:id', [UpdateLeaderboardController]).as('leaderboards.update')
      router.delete('/:id', [DeleteLeaderboardController]).as('leaderboards.destroy')
      router.get('/:id/entries', [ListLeaderboardEntriesController]).as('leaderboards.entries')
    })
    .prefix('/leaderboards')
    .use(middleware.auth())
}

export function registerGamificationEventApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListGamificationEventsController]).as('gamificationEvents.index')
      router.post('/', [CreateGamificationEventController]).as('gamificationEvents.store')
      router.get('/:id', [ShowGamificationEventController]).as('gamificationEvents.show')
      router.post('/:id/retry', [RetryGamificationEventController]).as('gamificationEvents.retry')
    })
    .prefix('/gamification-events')
    .use(middleware.auth())
}
