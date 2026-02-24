import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.stats')
export type InsuranceStatsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useInsuranceStatsQueryOptions() {
  return queryOptions({
    queryKey: ['insurance', 'stats'],
    queryFn: () => {
      return resolveRoute().$get().unwrap()
    },
  })
}
