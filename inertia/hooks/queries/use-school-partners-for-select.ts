import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['school-partners'].$get

export type SchoolPartnersForSelectResponse = InferResponseType<typeof $route>

type SchoolPartnersQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useSchoolPartnersForSelectQueryOptions(query: SchoolPartnersQuery = {}) {
  // For select we usually want all, but keep pagination defaults.
  const mergedQuery: SchoolPartnersQuery = {
    page: 1,
    limit: 100,
    ...query,
  }

  return {
    queryKey: ['school-partners', 'select', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<SchoolPartnersForSelectResponse>
}
