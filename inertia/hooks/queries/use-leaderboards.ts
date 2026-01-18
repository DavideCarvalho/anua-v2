import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.leaderboards.$get

export type LeaderboardsResponse = InferResponseType<typeof $route>

type LeaderboardsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useLeaderboardsQueryOptions(query: LeaderboardsQuery = {}) {
  const mergedQuery: LeaderboardsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['leaderboards', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
