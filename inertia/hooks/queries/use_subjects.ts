import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.subjects.$get

export type SubjectsResponse = InferResponseType<typeof $route>

type SubjectsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useSubjectsQueryOptions(query: SubjectsQuery = {}) {
  const mergedQuery: SubjectsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['subjects', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<SubjectsResponse>
}
