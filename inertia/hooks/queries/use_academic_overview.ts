import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.grades.academicOverview')
export type AcademicOverviewResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type AcademicOverviewQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useAcademicOverviewQueryOptions(query: AcademicOverviewQuery = {}) {
  return {
    queryKey: ['grades', 'academic-overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.grades.academicOverview').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<AcademicOverviewResponse>
}
