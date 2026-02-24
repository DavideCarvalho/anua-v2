import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.attendance.chronic')
export type ChronicAbsenteeismResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type ChronicAbsenteeismQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useChronicAbsenteeismQueryOptions(query: ChronicAbsenteeismQuery = {}) {
  return queryOptions({
    queryKey: ['analytics', 'attendance', 'chronic', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.attendance.chronic').$get({ query }).unwrap()
    },
  })
}
