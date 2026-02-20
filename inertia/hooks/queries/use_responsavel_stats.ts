import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type ResponsavelStatsRoute = ReturnType<typeof tuyau.$route<'api.v1.dashboard.responsavelStats'>>
type ResponsavelStatsGet = ResponsavelStatsRoute['$get']

export type ResponsavelStats = InferResponseType<ResponsavelStatsGet>

export function useResponsavelStatsQueryOptions() {
  return {
    queryKey: ['responsavel', 'stats'],
    queryFn: () => {
      const route = tuyau.$route('api.v1.dashboard.responsavelStats')
      return route.$get().unwrap()
    },
  } satisfies QueryOptions<ResponsavelStats>
}
