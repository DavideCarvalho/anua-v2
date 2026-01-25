import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['school-partners'].$get

export type SchoolPartnersResponse = InferResponseType<typeof $route>

type SchoolPartnersQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useSchoolPartnersQueryOptions(query: SchoolPartnersQuery = {}) {
  const mergedQuery: SchoolPartnersQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['school-partners', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
