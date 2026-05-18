import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerPedagogicalCalendarApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.pedagogicalCalendar.ListPedagogicalCalendar])
        .as('pedagogical_calendar.index')
      router
        .get('/creation-context', [controllers.pedagogicalCalendar.GetCreationContext])
        .as('pedagogical_calendar.creation_context')
    })
    .prefix('/pedagogical-calendar')
    .use([middleware.auth(), middleware.impersonation()])
}
