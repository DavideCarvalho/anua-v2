import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ListPedagogicalCalendarController = () =>
  import('#controllers/pedagogical_calendar/list_pedagogical_calendar_controller')
const GetCreationContextController = () =>
  import('#controllers/pedagogical_calendar/get_creation_context_controller')

export function registerPedagogicalCalendarApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListPedagogicalCalendarController]).as('pedagogical_calendar.index')
      router
        .get('/creation-context', [GetCreationContextController])
        .as('pedagogical_calendar.creation_context')
    })
    .prefix('/pedagogical-calendar')
    .use([middleware.auth(), middleware.impersonation()])
}
