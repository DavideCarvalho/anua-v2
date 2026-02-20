import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type NotificationsRoute = ReturnType<typeof tuyau.$route<'api.v1.notifications.index'>>
type NotificationsGet = NotificationsRoute['$get']

export type NotificationsResponse = InferResponseType<NotificationsGet>

type NotificationsQuery = NonNullable<Parameters<NotificationsGet>[0]>['query']

export function useNotificationsQueryOptions(query: NotificationsQuery = {}) {
  const mergedQuery: NotificationsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['notifications', mergedQuery],
    queryFn: () => {
      const route = tuyau.$route('api.v1.notifications.index')
      return route.$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<NotificationsResponse>
}
