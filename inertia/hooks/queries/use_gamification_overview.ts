import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.gamification.overview')
export type GamificationOverviewResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

type GamificationOverviewQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useGamificationOverviewQueryOptions(query: GamificationOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'gamification', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.gamification.overview').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<GamificationOverviewResponse>
}
