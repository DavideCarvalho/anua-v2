import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.analytics.defaultRate')
export type InsuranceDefaultRateResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useInsuranceDefaultRateQueryOptions(limit?: number) {
  return {
    queryKey: ['insurance', 'analytics', 'defaultRate', limit],
    queryFn: () => {
      return resolveRoute().$get({ query: { limit } }).unwrap()
    },
  } satisfies QueryOptions<InsuranceDefaultRateResponse>
}
