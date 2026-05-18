import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAcademicSubPeriodApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.academicSubPeriods.Index]).as('academic_sub_periods.index')
      router.get('/:id', [controllers.academicSubPeriods.Show]).as('academic_sub_periods.show')
      router.post('/', [controllers.academicSubPeriods.Store]).as('academic_sub_periods.store')
      router
        .post('/generate', [controllers.academicSubPeriods.Generate])
        .as('academic_sub_periods.generate')
      router.post('/diff', [controllers.academicSubPeriods.Diff]).as('academic_sub_periods.diff')
      router.put('/:id', [controllers.academicSubPeriods.Update]).as('academic_sub_periods.update')
      router
        .delete('/:id', [controllers.academicSubPeriods.Destroy])
        .as('academic_sub_periods.destroy')
    })
    .prefix('/academic-sub-periods')
    .use([middleware.auth(), middleware.impersonation()])
}
