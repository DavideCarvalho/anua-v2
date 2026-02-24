import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type ResponsavelStatsRoute = ReturnType<typeof tuyau.$route<'api.v1.dashboard.responsavelStats'>>
type ResponsavelStatsGet = ResponsavelStatsRoute['$get']

export type ResponsavelStats = InferResponseType<ResponsavelStatsGet>

export function useResponsavelStatsQueryOptions() {
  return queryOptions({
    queryKey: ['responsavel', 'stats'],
    queryFn: () => {
      const route = tuyau.$route('api.v1.dashboard.responsavelStats')
      return route.$get().unwrap()
    },
  })
}
