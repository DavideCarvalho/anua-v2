import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.notifications.index')

export type NotificationsResponse = InferResponseType<typeof $route.$get>

type NotificationsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useNotificationsQueryOptions(query: NotificationsQuery = {}) {
  const mergedQuery: NotificationsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['notifications', mergedQuery],
    queryFn: () => {
      return tuyau
        .$route('api.v1.notifications.index')
        .$get({ query: mergedQuery })
        .unwrap()
    },
  } satisfies QueryOptions<NotificationsResponse>
}
