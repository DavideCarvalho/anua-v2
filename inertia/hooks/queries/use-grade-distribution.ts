import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.grades.distribution')

export type GradeDistributionResponse = InferResponseType<typeof $route.$get>

type GradeDistributionQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useGradeDistributionQueryOptions(query: GradeDistributionQuery = {}) {
  return {
    queryKey: ['grades', 'distribution', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.grades.distribution')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<GradeDistributionResponse>
}
