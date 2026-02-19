import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Schools
const IndexSchoolsController = () => import('#controllers/schools/index')
const ShowSchoolController = () => import('#controllers/schools/show')
const ShowSchoolBySlugController = () => import('#controllers/schools/show_by_slug')
const StoreSchoolController = () => import('#controllers/schools/store')
const UpdateSchoolController = () => import('#controllers/schools/update')
const DestroySchoolController = () => import('#controllers/schools/destroy')
const UploadSchoolLogoController = () =>
  import('#controllers/schools/upload_school_logo_controller')
const UpdateSchoolDirectorController = () =>
  import('#controllers/schools/update_school_director_controller')
const ListSchoolUsersController = () => import('#controllers/schools/list_school_users_controller')

export function registerSchoolApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexSchoolsController]).as('schools.index')
      router.post('/', [StoreSchoolController]).as('schools.store')
      router.get('/slug/:slug', [ShowSchoolBySlugController]).as('schools.showBySlug')
      router.get('/:id', [ShowSchoolController]).as('schools.show')
      router
        .put('/:id', [UpdateSchoolController])
        .as('schools.update')
        .use([middleware.auth(), middleware.impersonation()])
      router.delete('/:id', [DestroySchoolController]).as('schools.destroy')
      router.post('/:id/logo', [UploadSchoolLogoController]).as('schools.uploadLogo')
      router.get('/:id/users', [ListSchoolUsersController]).as('schools.users')
      router.put('/:id/director', [UpdateSchoolDirectorController]).as('schools.updateDirector')
    })
    .prefix('/schools')
}
