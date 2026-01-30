import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.leaderboards.entries')

export type LeaderboardEntriesResponse = InferResponseType<typeof $route.$get>

interface UseLeaderboardEntriesOptions {
  leaderboardId: string
  page?: number
  limit?: number
}

export function useLeaderboardEntriesQueryOptions(options: UseLeaderboardEntriesOptions) {
  const { leaderboardId, page = 1, limit = 50 } = options

  return {
    queryKey: ['leaderboard-entries', leaderboardId, { page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.leaderboards.entries', { id: leaderboardId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!leaderboardId,
  }
}
