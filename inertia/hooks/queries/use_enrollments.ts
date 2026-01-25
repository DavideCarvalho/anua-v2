import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.enrollments.index')

export type EnrollmentsResponse = InferResponseType<typeof $route.$get>

type EnrollmentsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useEnrollmentsQueryOptions(query: EnrollmentsQuery) {
  const mergedQuery: EnrollmentsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['enrollments', mergedQuery],
    queryFn: () => {
      return $route.$get({ query: mergedQuery }).unwrap()
    },
    enabled: !!query.schoolId,
  } satisfies QueryOptions<EnrollmentsResponse>
}
