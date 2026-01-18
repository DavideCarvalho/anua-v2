import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['academic-periods'].$get

export type AcademicPeriodsResponse = InferResponseType<typeof $route>

type AcademicPeriodsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useAcademicPeriodsQueryOptions(query: AcademicPeriodsQuery = {}) {
  const mergedQuery: AcademicPeriodsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['academic-periods', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<AcademicPeriodsResponse>
}
