import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.school.claims')
export type SchoolInsuranceClaimsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useSchoolInsuranceClaimsQueryOptions(
  schoolId: string,
  status?: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED',
  limit?: number
) {
  return queryOptions({
    queryKey: ['insurance', 'school', schoolId, 'claims', status, limit],
    queryFn: () => {
      return tuyau
        .$route('api.v1.insurance.school.claims', { schoolId })
        .$get({ query: { schoolId, status, limit } })
        .unwrap()
    },
    enabled: !!schoolId,
  })
}
