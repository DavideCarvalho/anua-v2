import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['student-gamifications'].ranking.$get

export type PointsRankingResponse = InferResponseType<typeof $route>

type PointsRankingQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function usePointsRankingQueryOptions(query: PointsRankingQuery) {
  return {
    queryKey: ['student-gamifications', 'ranking', query],
    queryFn: () => {
      return $route({ query }).unwrap()
    },
  } satisfies QueryOptions
}
