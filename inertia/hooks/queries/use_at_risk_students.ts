import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.grades.atRisk')
export type AtRiskStudentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type AtRiskStudentsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useAtRiskStudentsQueryOptions(query: AtRiskStudentsQuery = {}) {
  return {
    queryKey: ['grades', 'at-risk', query],
    queryFn: () => {
      return tuyau.$route('api.v1.grades.atRisk').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<AtRiskStudentsResponse>
}
