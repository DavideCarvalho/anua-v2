import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.contracts.$get

export type ContractsResponse = InferResponseType<typeof $route>

type ContractsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useContractsQueryOptions(query: ContractsQuery = {}) {
  const mergedQuery: ContractsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['contracts', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<ContractsResponse>
}
