import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['academic-periods']

type AcademicPeriodCoursesGet = ReturnType<ReturnType<typeof resolveRoute>>['courses']['$get']
export type AcademicPeriodCoursesResponse = InferResponseType<AcademicPeriodCoursesGet>
type AcademicPeriodCoursesQuery = NonNullable<Parameters<AcademicPeriodCoursesGet>[0]>['query']

export function useAcademicPeriodCoursesQueryOptions(
  academicPeriodId: string,
  query: AcademicPeriodCoursesQuery = {}
) {
  return queryOptions({
    queryKey: ['academic-period', academicPeriodId, 'courses', query],
    queryFn: () => resolveRoute()({ id: academicPeriodId }).courses.$get({ query }).unwrap(),
  })
}
