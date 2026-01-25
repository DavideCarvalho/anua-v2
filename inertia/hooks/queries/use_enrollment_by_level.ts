import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.enrollments.byLevel')

export type EnrollmentByLevelResponse = InferResponseType<typeof $route.$get>

type ByLevelQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useEnrollmentByLevelQueryOptions(query: ByLevelQuery = {}) {
  return {
    queryKey: ['analytics', 'enrollments', 'byLevel', query],
    queryFn: () => {
      return $route.$get({ query }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentByLevelResponse>
}
