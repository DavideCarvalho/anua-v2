import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Notifications
const ListNotificationsController = () =>
  import('#controllers/notifications/list_notifications_controller')
const ShowNotificationController = () =>
  import('#controllers/notifications/show_notification_controller')
const MarkNotificationReadController = () =>
  import('#controllers/notifications/mark_notification_read_controller')
const MarkAllReadController = () => import('#controllers/notifications/mark_all_read_controller')
const DeleteNotificationController = () =>
  import('#controllers/notifications/delete_notification_controller')

// Notification Preferences
const ShowNotificationPreferencesController = () =>
  import('#controllers/notification_preferences/show_notification_preferences_controller')
const UpdateNotificationPreferencesController = () =>
  import('#controllers/notification_preferences/update_notification_preferences_controller')

export function registerNotificationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListNotificationsController]).as('notifications.index')
      router.get('/:id', [ShowNotificationController]).as('notifications.show')
      router.post('/:id/read', [MarkNotificationReadController]).as('notifications.markRead')
      router.post('/read-all', [MarkAllReadController]).as('notifications.markAllRead')
      router.delete('/:id', [DeleteNotificationController]).as('notifications.destroy')
    })
    .prefix('/notifications')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerNotificationPreferenceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ShowNotificationPreferencesController]).as('notificationPreferences.show')
      router
        .put('/', [UpdateNotificationPreferencesController])
        .as('notificationPreferences.update')
    })
    .prefix('/notification-preferences')
    .use([middleware.auth(), middleware.impersonation()])
}
