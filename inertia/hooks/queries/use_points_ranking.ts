import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['student-gamifications'].ranking.$get

export type PointsRankingResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type PointsRankingQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function usePointsRankingQueryOptions(query: PointsRankingQuery) {
  return {
    queryKey: ['student-gamifications', 'ranking', query],
    queryFn: () => {
      return resolveRoute()({ query }).unwrap()
    },
  } satisfies QueryOptions
}
