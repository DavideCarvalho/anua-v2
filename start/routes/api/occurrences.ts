import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerOccurrenceApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.occurrences.ListOccurrences]).as('occurrences.index')
      router.post('/', [controllers.occurrences.CreateOccurrence]).as('occurrences.store')
      router
        .get('/teacher-classes', [controllers.occurrences.ListOccurrenceTeacherClasses])
        .as('occurrences.teacher_classes')
      router.get('/:id', [controllers.occurrences.ShowOccurrence]).as('occurrences.show')
    })
    .prefix('/occurrences')
    .use([middleware.auth(), middleware.impersonation()])
}
