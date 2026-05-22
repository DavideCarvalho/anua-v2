import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerStudentFarmsApiRoutes() {
  router
    .group(() => {
      router.post('/claim-daily', [controllers.studentFarms.ClaimDailySeeds]).as('claim_daily')
      router.post('/plant', [controllers.studentFarms.PlantPlot]).as('plant')
      router.post('/harvest', [controllers.studentFarms.HarvestPlot]).as('harvest')
    })
    .prefix('/student-farms')
    .use([middleware.auth(), middleware.impersonation()])
    .as('student_farms')
}
