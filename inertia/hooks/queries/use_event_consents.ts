import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.events.consents.index')

export type EventConsentsResponse = InferResponseType<typeof $route.$get>

type EventConsentsParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']
type EventConsentsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useEventConsentsQueryOptions(eventId: string, query: EventConsentsQuery = {}) {
  const params: EventConsentsParams = { eventId }

  return {
    queryKey: ['events', eventId, 'consents', query],
    queryFn: () => {
      return $route.$get({ params, query }).unwrap()
    },
    enabled: !!eventId,
  } satisfies QueryOptions<EventConsentsResponse>
}
