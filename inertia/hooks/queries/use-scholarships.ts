import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.scholarships.$get

export type ScholarshipsResponse = InferResponseType<typeof $route>

type ScholarshipsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useScholarshipsQueryOptions(query: ScholarshipsQuery = {}) {
  const mergedQuery: ScholarshipsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['scholarships', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<ScholarshipsResponse>
}
