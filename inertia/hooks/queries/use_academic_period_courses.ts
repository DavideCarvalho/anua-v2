import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['academic-periods']

type AcademicPeriodCoursesGet = ReturnType<typeof $route>['courses']['$get']
export type AcademicPeriodCoursesResponse = InferResponseType<AcademicPeriodCoursesGet>
type AcademicPeriodCoursesQuery = NonNullable<Parameters<AcademicPeriodCoursesGet>[0]>['query']

export function useAcademicPeriodCoursesQueryOptions(
  academicPeriodId: string,
  query: AcademicPeriodCoursesQuery = {}
) {
  return {
    queryKey: ['academic-period', academicPeriodId, 'courses', query],
    queryFn: () => $route({ id: academicPeriodId }).courses.$get({ query }).unwrap(),
  } satisfies QueryOptions<AcademicPeriodCoursesResponse>
}
