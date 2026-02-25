import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.school.stats')
export type SchoolInsuranceStatsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useSchoolInsuranceStatsQueryOptions(schoolId: string) {
  return queryOptions({
    queryKey: ['insurance', 'school', schoolId, 'stats'],
    queryFn: () => {
      return tuyau
        .$route('api.v1.insurance.school.stats', { schoolId })
        .$get({ query: { schoolId } })
        .unwrap()
    },
    enabled: !!schoolId,
  })
}
