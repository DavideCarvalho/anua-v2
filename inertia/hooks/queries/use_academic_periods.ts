import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['academic-periods'].$get

export type AcademicPeriodsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type AcademicPeriodsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useAcademicPeriodsQueryOptions(query: AcademicPeriodsQuery = {}) {
  const mergedQuery: AcademicPeriodsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['academic-periods', mergedQuery],
    queryFn: () => resolveRoute()({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}
