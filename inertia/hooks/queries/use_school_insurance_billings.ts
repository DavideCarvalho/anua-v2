import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.school.billings')
export type SchoolInsuranceBillingsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useSchoolInsuranceBillingsQueryOptions(schoolId: string, limit?: number) {
  return queryOptions({
    queryKey: ['insurance', 'school', schoolId, 'billings', limit],
    queryFn: () => {
      return tuyau
        .$route('api.v1.insurance.school.billings', { schoolId })
        .$get({ query: { schoolId, limit } })
        .unwrap()
    },
    enabled: !!schoolId,
  })
}
