import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.grades.atRisk')

export type AtRiskStudentsResponse = InferResponseType<typeof $route.$get>

type AtRiskStudentsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useAtRiskStudentsQueryOptions(query: AtRiskStudentsQuery = {}) {
  return {
    queryKey: ['grades', 'at-risk', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.grades.atRisk')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<AtRiskStudentsResponse>
}
