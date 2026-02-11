import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ListOccurrencesController = () =>
  import('#controllers/occurrences/list_occurrences_controller')
const ShowOccurrenceController = () => import('#controllers/occurrences/show_occurrence_controller')
const CreateOccurrenceController = () =>
  import('#controllers/occurrences/create_occurrence_controller')
const ListOccurrenceTeacherClassesController = () =>
  import('#controllers/occurrences/list_occurrence_teacher_classes_controller')

export function registerOccurrenceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListOccurrencesController]).as('occurrences.index')
      router.post('/', [CreateOccurrenceController]).as('occurrences.store')
      router
        .get('/teacher-classes', [ListOccurrenceTeacherClassesController])
        .as('occurrences.teacherClasses')
      router.get('/:id', [ShowOccurrenceController]).as('occurrences.show')
    })
    .prefix('/occurrences')
    .use([middleware.auth(), middleware.impersonation()])
}
