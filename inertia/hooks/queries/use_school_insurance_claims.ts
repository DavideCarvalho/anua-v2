import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.school.claims')

export type SchoolInsuranceClaimsResponse = InferResponseType<typeof $route.$get>

export function useSchoolInsuranceClaimsQueryOptions(
  schoolId: string,
  status?: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED',
  limit?: number
) {
  return {
    queryKey: ['insurance', 'school', schoolId, 'claims', status, limit],
    queryFn: () => {
      return $route.$get({ params: { schoolId }, query: { status, limit } } as any).unwrap()
    },
    enabled: !!schoolId,
  }
}
