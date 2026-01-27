import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.dashboard.responsavelStats')

export type ResponsavelStats = InferResponseType<typeof $route.$get>

export function useResponsavelStatsQueryOptions() {
  return {
    queryKey: ['responsavel', 'stats'],
    queryFn: () => {
      return tuyau.$route('api.v1.dashboard.responsavelStats').$get().unwrap()
    },
  } satisfies QueryOptions<ResponsavelStats>
}
