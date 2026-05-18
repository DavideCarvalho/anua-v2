import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerSchoolApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.schools.Index]).as('schools.index')
      router.post('/', [controllers.schools.Store]).as('schools.store')
      router.get('/slug/:slug', [controllers.schools.ShowBySlug]).as('schools.show_by_slug')
      router.get('/:id', [controllers.schools.Show]).as('schools.show')
      router
        .put('/:id', [controllers.schools.Update])
        .as('schools.update')
        .use([middleware.auth(), middleware.impersonation()])
      router.delete('/:id', [controllers.schools.Destroy]).as('schools.destroy')
      router.post('/:id/logo', [controllers.schools.UploadSchoolLogo]).as('schools.upload_logo')
      router.get('/:id/users', [controllers.schools.ListSchoolUsers]).as('schools.users')
      router
        .put('/:id/director', [controllers.schools.UpdateSchoolDirector])
        .as('schools.update_director')
    })
    .prefix('/schools')
}
