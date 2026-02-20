import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.insurance.analytics.schoolsWithout')
export type SchoolsWithoutInsuranceResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useSchoolsWithoutInsuranceQueryOptions(limit?: number) {
  return {
    queryKey: ['insurance', 'analytics', 'schoolsWithout', limit],
    queryFn: () => {
      return resolveRoute().$get({ query: { limit } }).unwrap()
    },
  } satisfies QueryOptions<SchoolsWithoutInsuranceResponse>
}
