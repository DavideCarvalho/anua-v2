import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.grades.distribution')
export type GradeDistributionResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type GradeDistributionQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useGradeDistributionQueryOptions(query: GradeDistributionQuery = {}) {
  return queryOptions({
    queryKey: ['grades', 'distribution', query],
    queryFn: () => {
      return tuyau.$route('api.v1.grades.distribution').$get({ query }).unwrap()
    },
  })
}
