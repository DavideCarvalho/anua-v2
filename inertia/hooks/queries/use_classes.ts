import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.classes.$get

export type ClassesResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type ClassesQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useClassesQueryOptions(query: ClassesQuery = {}) {
  const mergedQuery: ClassesQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['classes', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<ClassesResponse>
}
