import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.school.stats')

export type SchoolInsuranceStatsResponse = InferResponseType<typeof $route.$get>

export function useSchoolInsuranceStatsQueryOptions(schoolId: string) {
  return {
    queryKey: ['insurance', 'school', schoolId, 'stats'],
    queryFn: () => {
      return tuyau.$route('api.v1.insurance.school.stats', { schoolId }).$get({} as any).unwrap()
    },
    enabled: !!schoolId,
  }
}
