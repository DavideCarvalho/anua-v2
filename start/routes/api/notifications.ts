import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerNotificationApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.notifications.ListNotifications]).as('notifications.index')
      router.get('/:id', [controllers.notifications.ShowNotification]).as('notifications.show')
      router
        .post('/:id/read', [controllers.notifications.MarkNotificationRead])
        .as('notifications.mark_read')
      router
        .post('/read-all', [controllers.notifications.MarkAllRead])
        .as('notifications.mark_all_read')
      router
        .delete('/:id', [controllers.notifications.DeleteNotification])
        .as('notifications.destroy')
    })
    .prefix('/notifications')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerNotificationPreferenceApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.notificationPreferences.ShowNotificationPreferences])
        .as('notification_preferences.show')
      router
        .put('/', [controllers.notificationPreferences.UpdateNotificationPreferences])
        .as('notification_preferences.update')
    })
    .prefix('/notification-preferences')
    .use([middleware.auth(), middleware.impersonation()])
}
