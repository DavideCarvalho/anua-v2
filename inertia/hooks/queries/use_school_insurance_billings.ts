import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.school.billings')
export type SchoolInsuranceBillingsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useSchoolInsuranceBillingsQueryOptions(schoolId: string, limit?: number) {
  return {
    queryKey: ['insurance', 'school', schoolId, 'billings', limit],
    queryFn: () => {
      return resolveRoute()
        .$get({ params: { schoolId }, query: { limit } } as any)
        .unwrap()
    },
    enabled: !!schoolId,
  }
}
