import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerStudentGamificationApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.studentGamifications.ListStudentGamifications])
        .as('student_gamifications.index')
      router
        .post('/', [controllers.studentGamifications.CreateStudentGamification])
        .as('student_gamifications.store')
      router
        .get('/:id', [controllers.studentGamifications.ShowStudentGamification])
        .as('student_gamifications.show')
      router
        .post('/add-points', [controllers.studentGamifications.AddPoints])
        .as('student_gamifications.add_points')
      router
        .get('/ranking', [controllers.studentGamifications.GetPointsRanking])
        .as('student_gamifications.ranking')
    })
    .prefix('/student-gamifications')
    .use(middleware.auth())

  // Student stats route (nested under students)
  router
    .group(() => {
      router
        .get('/:studentId/gamification/stats', [controllers.studentGamifications.GetStudentStats])
        .as('students.gamification_stats')
    })
    .prefix('/students')
    .use(middleware.auth())
}

export function registerLeaderboardApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.leaderboards.ListLeaderboards]).as('leaderboards.index')
      router.post('/', [controllers.leaderboards.CreateLeaderboard]).as('leaderboards.store')
      router.get('/:id', [controllers.leaderboards.ShowLeaderboard]).as('leaderboards.show')
      router.put('/:id', [controllers.leaderboards.UpdateLeaderboard]).as('leaderboards.update')
      router.delete('/:id', [controllers.leaderboards.DeleteLeaderboard]).as('leaderboards.destroy')
      router
        .get('/:id/entries', [controllers.leaderboards.ListLeaderboardEntries])
        .as('leaderboards.entries')
    })
    .prefix('/leaderboards')
    .use(middleware.auth())
}

export function registerGamificationEventApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.gamificationEvents.ListGamificationEvents])
        .as('gamification_events.index')
      router
        .post('/', [controllers.gamificationEvents.CreateGamificationEvent])
        .as('gamification_events.store')
      router
        .get('/:id', [controllers.gamificationEvents.ShowGamificationEvent])
        .as('gamification_events.show')
      router
        .post('/:id/retry', [controllers.gamificationEvents.RetryGamificationEvent])
        .as('gamification_events.retry')
    })
    .prefix('/gamification-events')
    .use(middleware.auth())
}

export function registerChallengeApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.challenges.ListChallenges]).as('challenges.index')
      router.post('/', [controllers.challenges.CreateChallenge]).as('challenges.store')
      router.get('/:id', [controllers.challenges.ShowChallenge]).as('challenges.show')
      router.put('/:id', [controllers.challenges.UpdateChallenge]).as('challenges.update')
      router.delete('/:id', [controllers.challenges.DeleteChallenge]).as('challenges.destroy')
    })
    .prefix('/challenges')
    .use(middleware.auth())
}
