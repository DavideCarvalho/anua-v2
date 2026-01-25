import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.stats')

export type InsuranceStatsResponse = InferResponseType<typeof $route.$get>

export function useInsuranceStatsQueryOptions() {
  return {
    queryKey: ['insurance', 'stats'],
    queryFn: () => {
      return $route.$get().unwrap()
    },
  } satisfies QueryOptions<InsuranceStatsResponse>
}
