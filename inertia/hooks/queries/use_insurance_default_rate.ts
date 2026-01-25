import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.analytics.defaultRate')

export type InsuranceDefaultRateResponse = InferResponseType<typeof $route.$get>

export function useInsuranceDefaultRateQueryOptions(limit?: number) {
  return {
    queryKey: ['insurance', 'analytics', 'defaultRate', limit],
    queryFn: () => {
      return $route.$get({ query: { limit } }).unwrap()
    },
  } satisfies QueryOptions<InsuranceDefaultRateResponse>
}
