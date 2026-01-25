import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.analytics.schoolsWithout')

export type SchoolsWithoutInsuranceResponse = InferResponseType<typeof $route.$get>

export function useSchoolsWithoutInsuranceQueryOptions(limit?: number) {
  return {
    queryKey: ['insurance', 'analytics', 'schoolsWithout', limit],
    queryFn: () => {
      return $route.$get({ query: { limit } }).unwrap()
    },
  } satisfies QueryOptions<SchoolsWithoutInsuranceResponse>
}
