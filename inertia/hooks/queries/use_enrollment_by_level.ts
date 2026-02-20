import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.analytics.enrollments.byLevel')
export type EnrollmentByLevelResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type ByLevelQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useEnrollmentByLevelQueryOptions(query: ByLevelQuery = {}) {
  return {
    queryKey: ['analytics', 'enrollments', 'byLevel', query],
    queryFn: () => {
      return resolveRoute().$get({ query }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentByLevelResponse>
}
