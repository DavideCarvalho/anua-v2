import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.stores.$get

export type StoresResponse = InferResponseType<typeof $route>

type StoresQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useStoresQueryOptions(query: StoresQuery = {}) {
  const mergedQuery: StoresQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['stores', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
