import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const IndexController = () => import('#controllers/academic_sub_periods/index')
const ShowController = () => import('#controllers/academic_sub_periods/show')
const StoreController = () => import('#controllers/academic_sub_periods/store')
const UpdateController = () => import('#controllers/academic_sub_periods/update')
const DestroyController = () => import('#controllers/academic_sub_periods/destroy')
const GenerateController = () => import('#controllers/academic_sub_periods/generate_controller')

export function registerAcademicSubPeriodApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexController]).as('academic_sub_periods.index')
      router.get('/:id', [ShowController]).as('academic_sub_periods.show')
      router.post('/', [StoreController]).as('academic_sub_periods.store')
      router.post('/generate', [GenerateController]).as('academic_sub_periods.generate')
      router.put('/:id', [UpdateController]).as('academic_sub_periods.update')
      router.delete('/:id', [DestroyController]).as('academic_sub_periods.destroy')
    })
    .prefix('/academic-sub-periods')
    .use([middleware.auth(), middleware.impersonation()])
}
