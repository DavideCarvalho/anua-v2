import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.gamification.overview')

export type GamificationOverviewResponse = InferResponseType<typeof $route.$get>

type GamificationOverviewQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useGamificationOverviewQueryOptions(query: GamificationOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'gamification', 'overview', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.analytics.gamification.overview')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<GamificationOverviewResponse>
}
