import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.events.index')
export type EventsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type EventsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useEventsQueryOptions(query: EventsQuery = {}) {
  const mergedQuery: EventsQuery = {
    page: 1,
    limit: 100,
    ...query,
  }

  return queryOptions({
    queryKey: ['events', mergedQuery],
    queryFn: () => {
      return tuyau.$route('api.v1.events.index').$get({ query: mergedQuery }).unwrap()
    },
  })
}
