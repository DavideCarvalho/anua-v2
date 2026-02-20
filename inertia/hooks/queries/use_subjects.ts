import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.subjects.$get

export type SubjectsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type SubjectsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useSubjectsQueryOptions(query: SubjectsQuery = {}) {
  const mergedQuery: SubjectsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['subjects', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<SubjectsResponse>
}
