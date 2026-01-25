import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.events.show')

export type EventResponse = InferResponseType<typeof $route.$get>

type EventParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']

export function useEventQueryOptions(params: EventParams) {
  return {
    queryKey: ['events', params.id],
    queryFn: () => {
      return tuyau.$route('api.v1.events.show').$get({ params }).unwrap()
    },
    enabled: !!params.id,
  } satisfies QueryOptions<EventResponse>
}
