import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.notificationPreferences.show')
export type NotificationPreferencesResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useNotificationPreferencesQueryOptions() {
  return {
    queryKey: ['notification-preferences'],
    queryFn: () => {
      return tuyau.$route('api.v1.notificationPreferences.show').$get().unwrap()
    },
  } satisfies QueryOptions<NotificationPreferencesResponse>
}
