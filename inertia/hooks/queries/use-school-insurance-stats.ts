import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.school.stats')

export type SchoolInsuranceStatsResponse = InferResponseType<typeof $route.$get>

export function useSchoolInsuranceStatsQueryOptions(schoolId: string) {
  return {
    queryKey: ['insurance', 'school', schoolId, 'stats'],
    queryFn: () => {
      return $route.$get({ params: { schoolId } }).unwrap()
    },
    enabled: !!schoolId,
  } satisfies QueryOptions<SchoolInsuranceStatsResponse>
}
