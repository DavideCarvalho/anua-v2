import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.attendance.chronic')

export type ChronicAbsenteeismResponse = InferResponseType<typeof $route.$get>

type ChronicAbsenteeismQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useChronicAbsenteeismQueryOptions(query: ChronicAbsenteeismQuery = {}) {
  return {
    queryKey: ['analytics', 'attendance', 'chronic', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.analytics.attendance.chronic')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<ChronicAbsenteeismResponse>
}
