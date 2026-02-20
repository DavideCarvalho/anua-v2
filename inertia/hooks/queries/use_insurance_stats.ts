import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.insurance.stats')
export type InsuranceStatsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useInsuranceStatsQueryOptions() {
  return {
    queryKey: ['insurance', 'stats'],
    queryFn: () => {
      return resolveRoute().$get().unwrap()
    },
  } satisfies QueryOptions<InsuranceStatsResponse>
}
