import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['academic-periods']

type AcademicPeriodGet = ReturnType<typeof $route>['$get']
export type AcademicPeriodResponse = InferResponseType<AcademicPeriodGet>

export function useAcademicPeriodQueryOptions(academicPeriodId: string) {
  return {
    queryKey: ['academic-period', academicPeriodId],
    queryFn: () => $route({ id: academicPeriodId }).$get().unwrap(),
  } satisfies QueryOptions<AcademicPeriodResponse>
}
