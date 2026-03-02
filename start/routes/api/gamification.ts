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

// Challenges
const ListChallengesController = () => import('#controllers/challenges/list_challenges_controller')
const ShowChallengeController = () => import('#controllers/challenges/show_challenge_controller')
const CreateChallengeController = () =>
  import('#controllers/challenges/create_challenge_controller')
const UpdateChallengeController = () =>
  import('#controllers/challenges/update_challenge_controller')
const DeleteChallengeController = () =>
  import('#controllers/challenges/delete_challenge_controller')

export function registerStudentGamificationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStudentGamificationsController]).as('student_gamifications.index')
      router.post('/', [CreateStudentGamificationController]).as('student_gamifications.store')
      router.get('/:id', [ShowStudentGamificationController]).as('student_gamifications.show')
      router.post('/add-points', [AddPointsController]).as('student_gamifications.add_points')
      router.get('/ranking', [GetPointsRankingController]).as('student_gamifications.ranking')
    })
    .prefix('/student-gamifications')
    .use(middleware.auth())

  // Student stats route (nested under students)
  router
    .group(() => {
      router
        .get('/:studentId/gamification/stats', [GetStudentStatsController])
        .as('students.gamification_stats')
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
      router.get('/', [ListGamificationEventsController]).as('gamification_events.index')
      router.post('/', [CreateGamificationEventController]).as('gamification_events.store')
      router.get('/:id', [ShowGamificationEventController]).as('gamification_events.show')
      router.post('/:id/retry', [RetryGamificationEventController]).as('gamification_events.retry')
    })
    .prefix('/gamification-events')
    .use(middleware.auth())
}

export function registerChallengeApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListChallengesController]).as('challenges.index')
      router.post('/', [CreateChallengeController]).as('challenges.store')
      router.get('/:id', [ShowChallengeController]).as('challenges.show')
      router.put('/:id', [UpdateChallengeController]).as('challenges.update')
      router.delete('/:id', [DeleteChallengeController]).as('challenges.destroy')
    })
    .prefix('/challenges')
    .use(middleware.auth())
}
