import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.scholarships.$get

export type ScholarshipsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type ScholarshipsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useScholarshipsQueryOptions(query: ScholarshipsQuery = {}) {
  const mergedQuery: ScholarshipsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['scholarships', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<ScholarshipsResponse>
}
