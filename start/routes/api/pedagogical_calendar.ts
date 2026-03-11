import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ListPedagogicalCalendarController = () =>
  import('#controllers/pedagogical_calendar/list_pedagogical_calendar_controller')

export function registerPedagogicalCalendarApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListPedagogicalCalendarController]).as('pedagogical_calendar.index')
    })
    .prefix('/pedagogical-calendar')
    .use([middleware.auth(), middleware.impersonation()])
}
