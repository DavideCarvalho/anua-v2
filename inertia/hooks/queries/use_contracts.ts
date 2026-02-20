import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.contracts.$get

export type ContractsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type ContractsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useContractsQueryOptions(query: ContractsQuery = {}) {
  const mergedQuery: ContractsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['contracts', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<ContractsResponse>
}
