import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.grades.academicOverview')

export type AcademicOverviewResponse = InferResponseType<typeof $route.$get>

type AcademicOverviewQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useAcademicOverviewQueryOptions(query: AcademicOverviewQuery = {}) {
  return {
    queryKey: ['grades', 'academic-overview', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.grades.academicOverview')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<AcademicOverviewResponse>
}
