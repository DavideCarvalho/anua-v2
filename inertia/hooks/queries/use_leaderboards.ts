import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.leaderboards.$get

export type LeaderboardsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type LeaderboardsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useLeaderboardsQueryOptions(query: LeaderboardsQuery = {}) {
  const mergedQuery: LeaderboardsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['leaderboards', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
